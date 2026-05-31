# Gallery — Better Call Saul in action

These are **illustrative** outputs that show the shape and tone of what the Saul
fixer produces inside your agent host. They were written to demonstrate the
10-section format — real results are generated live by your host model
(OpenClaw / Claude Code) from your actual facts, so they will be tailored to
your situation. Nothing here is legal advice.

> Format per case: **Input** (what the user types) → **Output** (abridged Saul
> response). Real responses include every section; these are trimmed for length.

---

## 1. Marketplace: "new" laptop arrived scratched

**Input**

> I bought a laptop listed as new. It arrived resealed, scratched, battery cycle
> count over 300. Seller says it's normal warehouse handling and refuses a
> refund. I have photos, the listing screenshot, and the support chat.

**Output (abridged)**

- **Best angle:** Not as described — "new" is contradicted by your condition
  evidence (cycle count, scratches, reseal).
- **Evidence needed:** listing screenshot, unboxing photos, battery health
  screenshot, full support transcript, order/payment record.
- **Polite script:** "Hi, the unit I received was listed as new but shows 300+
  battery cycles and cosmetic damage. I'd like a full refund or a genuinely new
  replacement with a prepaid return label."
- **Firm script:** "The item materially differs from the listing. Under the
  marketplace's 'not as described' policy I'm requesting a full refund within 5
  business days, after which I'll open a buyer-protection claim."
- **If they reply "normal wear":** Restate that a *new* listing sets the
  standard; 300 cycles is used inventory. Attach the battery screenshot again.
- **Risk check:** Low. Keep everything in writing; don't return until a return
  label/refund is confirmed.
- **Saul Commentary:** You're not asking for a favor — you're holding them to
  their own word. The cycle count is the kill shot; lead with it.

---

## 2. Landlord withholding a deposit

**Input**

> My landlord is keeping my full $1,800 deposit for "cleaning and wear" but the
> flat was cleaner than when I moved in. I have move-in and move-out photos.

**Output (abridged)**

- **Best angle:** Normal wear-and-tear is not deductible; your dated photos
  rebut the "damage" claim.
- **Evidence needed:** signed inventory/condition report, move-in + move-out
  photos with timestamps, the deposit receipt, any local deposit-protection
  scheme reference.
- **Firm script:** "Please send an itemized list of deductions with receipts
  within 14 days. Normal wear is not chargeable. My dated move-out photos show
  the unit in equal or better condition than move-in."
- **Legalistic script:** References the duty to itemize deductions and the
  timeframe to return a deposit (general info — check your local rules).
- **Risk check:** Medium if no written inventory exists; photos still help.
- **Saul Commentary:** Make them itemize. Vague "cleaning and wear" collapses
  the moment they have to attach receipts.

---

## 3. Freelance client paying half after scope creep

**Input**

> A client accepted my proposal, added two pages, delayed feedback 3 weeks, then
> said they'll pay 50% because the launch date slipped.

**Output (abridged)**

- **Best angle:** The delay was caused by their late feedback and added scope —
  the deadline shifted because of them, not you.
- **Polite script:** "Happy to get this over the line. The timeline moved due to
  the two added pages and the 3-week feedback gap on your side, so the original
  fee stands. Here's the updated invoice."
- **Firm script:** "Per our agreement, the accepted proposal fee is due in full.
  Added scope and client-side delays don't reduce the contracted amount. Payment
  terms: net 7."
- **If they reply "but we launched late":** Map the timeline back to their
  feedback dates. Attach the message thread.
- **Risk check:** Medium. Keep tone collaborative until they refuse; then switch
  to formal invoice + late-fee terms.
- **Saul Commentary:** Reframe "you were late" into "you got more work, later
  inputs, same loyalty." The timeline is your evidence.

---

## 4. Hotel downgrade after an overbooking

**Input**

> The hotel overbooked, moved me to a worse property, and won't refund the
> difference. I booked through an OTA.

**Output (abridged)**

- **Best angle:** Failure to provide the booked service; you're owed the
  difference plus reasonable costs of the downgrade.
- **Evidence needed:** booking confirmation, the rate paid, photos/description of
  the substituted property, any walk/relocation notice.
- **Escalation ladder:** front desk → hotel duty manager → OTA dispute → card
  chargeback as last resort (only for a genuine service failure).
- **Firm script:** "I paid for X and received a lower-category property due to
  your overbooking. Please refund the rate difference and the taxi/transfer
  costs. I've also opened a case with the OTA."
- **Risk check:** Low–medium. Use chargeback only after the hotel/OTA refuse in
  writing.
- **Saul Commentary:** Two levers at once — the hotel caused it, the OTA
  guaranteed it. Make them point at each other while you collect.

---

## 5. Subscription that won't let you cancel

**Input**

> I cancelled a SaaS subscription before renewal but they charged me anyway and
> say cancellation "didn't go through."

**Output (abridged)**

- **Best angle:** Billing error — you have a cancellation record predating the
  charge.
- **Evidence needed:** cancellation confirmation email/screenshot with
  timestamp, the charge, the renewal date, their cancellation policy text.
- **Firm script:** "I cancelled on [date], before the [renewal date]. The charge
  is therefore in error. Please reverse it within 5 business days. Screenshot of
  my cancellation attached."
- **If they reply "no record":** Your timestamp beats their "no record." Ask them
  to escalate to billing and reference the policy clause.
- **Risk check:** Low. If denied in writing, a card dispute is legitimate here.
- **Saul Commentary:** A timestamped cancellation is a receipt. Their missing
  log is their problem, not yours.

---

## 6. Bank fee reversal after a failed transfer

**Input**

> My bank charged me a $35 fee for an overdraft caused by their own delayed
> transfer. First call got me nowhere.

**Output (abridged)**

- **Best angle:** The overdraft was caused by the bank's processing delay, not
  your spending — the fee should be reversed as a courtesy/error correction.
- **Polite script:** "On [date] the transfer I initiated on [earlier date]
  posted late, which triggered a $35 overdraft fee. Since the delay was on your
  side, please reverse the fee."
- **Firm script:** Requests a supervisor, references your history as an
  account-holder in good standing, and asks for written confirmation of the
  reversal.
- **Risk check:** Low. Fee reversals are routine; persistence + the timeline is
  usually enough.
- **Saul Commentary:** Be calm, be specific, ask for a supervisor early. "Your
  delay, your fee" is the whole argument.

---

> Want one of these for your exact situation? Install the skills/subagent (see
> [docs/INSTALL.md](docs/INSTALL.md)) and ask your agent host, or run
> `saul bundle --text "your dispute"` to get a paste-ready prompt.
