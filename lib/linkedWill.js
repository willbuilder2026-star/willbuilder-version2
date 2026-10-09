import { supabase } from "./supabaseClient";

// Creates the second half of a linked pair of Wills for a couple.
//
// Per the agreed approach, a couple is always given two separate legal
// Wills — never a single joint document — but the two can be linked so
// the partner doesn't have to start from a blank page:
//   - "basics_only": just carries over the household basics (name,
//     address, who each other's partner is) — everything else (gifts,
//     executors, beneficiaries) is answered separately for each person.
//   - "mirror": also copies executors/property/gifts/beneficiaries etc.
//     across as a starting point, with roles swapped ("my partner"
//     becomes the original testator's name, and vice versa) — the
//     partner can then edit or remove anything that isn't right for them.
//
// Both Wills end up pointing at each other via `linked_will_id`, and
// neither offers to create yet another linked Will once that's set.
export async function createLinkedWill({ originalWillId, userId, linkMode }) {
  const [{ data: originalWill }, { data: about }, { data: partner }] = await Promise.all([
    supabase.from("wills").select("*").eq("id", originalWillId).maybeSingle(),
    supabase.from("will_about").select("*").eq("will_id", originalWillId).maybeSingle(),
    supabase.from("will_partner").select("*").eq("will_id", originalWillId).maybeSingle(),
  ]);

  if (!originalWill) throw new Error("Could not find this Will.");
  if (!about?.full_name) throw new Error("Add your own name on \"About your Will\" first, and save it.");
  if (!partner?.has_partner || !partner?.partner_name) {
    throw new Error("Add your partner's name above and save it first, before creating their linked Will.");
  }

  const { data: newWill, error: createError } = await supabase
    .from("wills")
    .insert({
      user_id: userId,
      jurisdiction: originalWill.jurisdiction,
      will_type: "couple",
      link_mode: linkMode,
      label: `${partner.partner_name}'s Will`,
    })
    .select()
    .single();
  if (createError) throw createError;

  // Link both sides to each other.
  const [{ error: linkBackError }] = await Promise.all([
    supabase.from("wills").update({ linked_will_id: newWill.id, will_type: "couple", link_mode: linkMode }).eq("id", originalWillId),
    supabase.from("wills").update({ linked_will_id: originalWillId }).eq("id", newWill.id),
  ]);
  if (linkBackError) throw linkBackError;

  // Household basics: the partner's own "About" starts from their name and
  // the same address; their "Partner" record points back the other way.
  const [{ error: aboutError }, { error: partnerError }] = await Promise.all([
    supabase.from("will_about").insert({
      will_id: newWill.id,
      user_id: userId,
      full_name: partner.partner_name,
      date_of_birth: partner.partner_date_of_birth || null,
      address: about.address || null,
      postcode: about.postcode || null,
      marital_status: about.marital_status || null,
    }),
    supabase.from("will_partner").insert({
      will_id: newWill.id,
      user_id: userId,
      has_partner: true,
      partner_name: about.full_name,
      partner_date_of_birth: about.date_of_birth || null,
    }),
  ]);
  if (aboutError) throw aboutError;
  if (partnerError) throw partnerError;

  if (linkMode === "mirror") {
    await mirrorRemainingStages({
      originalWillId,
      newWillId: newWill.id,
      userId,
      ownName: about.full_name,
      partnerName: partner.partner_name,
    });
  }

  return newWill;
}

// Wherever a copied row named the original testator's partner (which, from
// the new Will's point of view, is themself), it should now read as "my
// partner" — the original testator — instead. Every other name (children,
// third parties, charities) copies across unchanged.
function swapName(name, partnerName, ownNameForNewWill) {
  if (!name) return name;
  return name.trim().toLowerCase() === partnerName.trim().toLowerCase() ? ownNameForNewWill : name;
}

async function mirrorRemainingStages({ originalWillId, newWillId, userId, ownName, partnerName }) {
  const swap = (name) => swapName(name, partnerName, ownName);
  const base = { will_id: newWillId, user_id: userId };

  const [
    { data: children },
    { data: guardians },
    { data: executors },
    { data: properties },
    { data: gifts },
    { data: charityGifts },
    { data: beneficiaries },
  ] = await Promise.all([
    supabase.from("children").select("*").eq("will_id", originalWillId),
    supabase.from("guardians").select("*").eq("will_id", originalWillId),
    supabase.from("executors").select("*").eq("will_id", originalWillId),
    supabase.from("properties").select("*").eq("will_id", originalWillId),
    supabase.from("gifts").select("*").eq("will_id", originalWillId),
    supabase.from("charity_gifts").select("*").eq("will_id", originalWillId),
    supabase.from("residuary_beneficiaries").select("*").eq("will_id", originalWillId),
  ]);

  const inserts = [];
  if (children?.length) {
    inserts.push(supabase.from("children").insert(children.map((c) => ({ ...base, name: c.name, date_of_birth: c.date_of_birth }))));
  }
  if (guardians?.length) {
    inserts.push(supabase.from("guardians").insert(guardians.map((g) => ({ ...base, name: swap(g.name), address: g.address, postcode: g.postcode }))));
  }
  if (executors?.length) {
    inserts.push(
      supabase.from("executors").insert(executors.map((e) => ({ ...base, name: swap(e.name), address: e.address, postcode: e.postcode, role: e.role })))
    );
  }
  if (properties?.length) {
    inserts.push(supabase.from("properties").insert(properties.map((p) => ({ ...base, description: p.description, ownership_type: p.ownership_type }))));
  }
  if (gifts?.length) {
    inserts.push(supabase.from("gifts").insert(gifts.map((g) => ({ ...base, item: g.item, beneficiary: swap(g.beneficiary) }))));
  }
  if (charityGifts?.length) {
    inserts.push(supabase.from("charity_gifts").insert(charityGifts.map((c) => ({ ...base, charity_name: c.charity_name, amount: c.amount }))));
  }
  await Promise.all(inserts);

  if (beneficiaries?.length) {
    // Beneficiaries need their new ids back, so any named "if they
    // predecease me" people carry over under the right parent row.
    const { data: newBeneficiaries, error } = await supabase
      .from("residuary_beneficiaries")
      .insert(
        beneficiaries.map((b) => ({
          ...base,
          name: swap(b.name),
          share_percent: b.share_percent,
          contingency: b.contingency || (b.deceased ? "to_children" : "none"),
        }))
      )
      .select();

    if (!error && newBeneficiaries?.length === beneficiaries.length) {
      const idMap = {};
      beneficiaries.forEach((old, i) => {
        idMap[old.id] = newBeneficiaries[i]?.id;
      });
      const { data: namedPeople } = await supabase.from("residuary_beneficiary_children").select("*").eq("will_id", originalWillId);
      const toInsert = (namedPeople || [])
        .filter((p) => idMap[p.beneficiary_id])
        .map((p) => ({ ...base, beneficiary_id: idMap[p.beneficiary_id], name: swap(p.name), share_percent: p.share_percent }));
      if (toInsert.length) await supabase.from("residuary_beneficiary_children").insert(toInsert);
    }
  }
}
