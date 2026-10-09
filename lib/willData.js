import { supabase } from "./supabaseClient";

// Pulls together everything entered for one Will, across every stage table,
// so the Review, Document and Signing pages can all share one fetch.
export async function fetchWillData(willId) {
  const [
    wills,
    about,
    partner,
    children,
    guardians,
    executors,
    properties,
    pensions,
    pensionEntries,
    gifts,
    charityGifts,
    beneficiaries,
    residuaryChildren,
    settings,
    adminNotes,
  ] = await Promise.all([
    supabase.from("wills").select("*").eq("id", willId).maybeSingle(),
    supabase.from("will_about").select("*").eq("will_id", willId).maybeSingle(),
    supabase.from("will_partner").select("*").eq("will_id", willId).maybeSingle(),
    supabase.from("children").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("guardians").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("executors").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("properties").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("pensions").select("*").eq("will_id", willId).maybeSingle(),
    supabase.from("pension_entries").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("gifts").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("charity_gifts").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("residuary_beneficiaries").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("residuary_beneficiary_children").select("*").eq("will_id", willId).order("created_at"),
    supabase.from("residuary_settings").select("*").eq("will_id", willId).maybeSingle(),
    supabase.from("admin_notes").select("*").eq("will_id", willId).order("created_at"),
  ]);

  return {
    will: wills.data || null,
    about: about.data || null,
    partner: partner.data || null,
    children: children.data || [],
    guardians: guardians.data || [],
    executors: executors.data || [],
    properties: properties.data || [],
    pensions: pensions.data || null,
    pensionEntries: pensionEntries.data || [],
    gifts: gifts.data || [],
    charityGifts: charityGifts.data || [],
    beneficiaries: beneficiaries.data || [],
    residuaryChildren: residuaryChildren.data || [],
    settings: settings.data || null,
    adminNotes: adminNotes.data || [],
  };
}

// Every name already entered anywhere in this Will, for the "pick a person
// already listed" dropdowns on Executors / Gifts / Residuary Beneficiaries.
export async function fetchKnownPeople(willId) {
  const [partner, children, guardians, executors, beneficiaries] = await Promise.all([
    supabase.from("will_partner").select("has_partner, partner_name").eq("will_id", willId).maybeSingle(),
    supabase.from("children").select("name").eq("will_id", willId),
    supabase.from("guardians").select("name").eq("will_id", willId),
    supabase.from("executors").select("name").eq("will_id", willId),
    supabase.from("residuary_beneficiaries").select("name").eq("will_id", willId),
  ]);

  const names = new Set();
  if (partner.data?.has_partner && partner.data.partner_name) names.add(partner.data.partner_name);
  (children.data || []).forEach((c) => c.name && names.add(c.name));
  (guardians.data || []).forEach((g) => g.name && names.add(g.name));
  (executors.data || []).forEach((e) => e.name && names.add(e.name));
  (beneficiaries.data || []).forEach((b) => b.name && names.add(b.name));
  return Array.from(names).sort();
}

export const JURISDICTION_LABELS = {
  england_wales: "England & Wales",
  scotland: "Scotland",
  northern_ireland: "Northern Ireland",
};
