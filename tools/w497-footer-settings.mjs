// W497 step 2 (06/10/2026): fill the footer settings that the new footer
// section code reads. Run AFTER step 1 (sections/footer.liquid + the NAJ
// asset) is live, because Shopify rejects a section-group JSON that names a
// block type its section does not have yet.
//
//   ./tools/fye run w497-footer-settings.mjs   then   ./tools/fye push "Footer: NAJ mark, Instagram and LinkedIn"
//
// Pulls first so it edits Shopify's latest copy of footer-group.json, and is
// safe to run twice.
import fs from 'fs';
import { execSync } from 'child_process';

execSync('git pull --rebase', { stdio: 'inherit' });

const p = 'sections/footer-group.json';
const raw = fs.readFileSync(p, 'utf8');
const start = raw.indexOf('{', raw.indexOf('*/'));
const head = raw.slice(0, start);
const doc = JSON.parse(raw.slice(start));
const f = doc.sections.footer;

f.settings.instagram_url = 'https://www.instagram.com/foryoureternityjewellery/';
f.settings.linkedin_url = 'https://www.linkedin.com/company/for-your-eternity';
f.settings.accred_text = f.settings.accred_text || 'A proud member of the National Association of Jewellers';

f.blocks.accred_naj = {
  type: 'accreditation',
  settings: {
    asset: 'naj-member-tile.png',
    link: 'https://www.naj.co.uk',
    alt: 'Member of the National Association of Jewellers'
  }
};
if (!f.block_order.includes('accred_naj')) f.block_order.push('accred_naj');

fs.writeFileSync(p, head + JSON.stringify(doc, null, 2) + '\n');
console.log('footer-group.json updated: Instagram, LinkedIn, NAJ mark.');
