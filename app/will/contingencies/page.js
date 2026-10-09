"use client";

import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";

export default function ContingenciesPage() {
  return (
    <WillStageShell>
      {(willId) => (
        <WillPageFrame willId={willId} current={10} desc="What happens if a beneficiary can't inherit.">
          <div style={{ fontSize: 14.5, color: "#4a5867", lineHeight: 1.7 }}>
            <p>You've already covered the main contingency on the previous stage, for each residuary beneficiary:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>
                Choosing <strong>"passes to specific people they choose"</strong> and naming them means their share is
                split between the people you named instead — this could be their own children, but doesn't have to
                be; it can be anyone you choose. It shows on the Family &amp; Estate Map.
              </li>
              <li>
                Choosing <strong>"redistributed among the other beneficiaries"</strong> means their share is shared out
                proportionally among whoever else is still listed — this is also what happens automatically if
                "passes to specific people they choose" is picked but nobody's actually been named.
              </li>
              <li>
                If your partner is set to inherit everything first, the residuary beneficiaries you listed only inherit if
                your partner doesn't survive you.
              </li>
            </ul>
            <p>
              If you want a different fallback arrangement for a beneficiary — for example, a gift going to a named
              alternative person entirely — make a note of it on the next stage (Admin Notes) so it isn't missed, and
              mention it if you get this Will reviewed.
            </p>
          </div>
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
