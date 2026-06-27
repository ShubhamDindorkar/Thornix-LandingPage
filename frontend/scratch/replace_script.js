const fs = require('fs');
const paths = [
  'e:/Projects/Thornix-LandingPage/frontend/src/app/page.tsx',
  'e:/Projects/Thornix-LandingPage/frontend/src/app/about/page.tsx'
];

paths.forEach(p => {
  let c = fs.readFileSync(p, 'utf8');
  // Match <ScrollReveal as="p" textClassName="...">...</ScrollReveal>
  c = c.replace(/<ScrollReveal\s+as="p"\s+textClassName="([^"]+)"\s*>([\s\S]*?)<\/ScrollReveal>/g, '<p className="$1">$2</p>');
  fs.writeFileSync(p, c);
  console.log('Updated ' + p);
});
