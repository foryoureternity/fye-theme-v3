/* dump-megamenus.js — 29/08/2026
 *
 * Paste into the browser console on a site with the header rendered. Walks
 * ALL FIVE mega panels — Engagement, Wedding, Eternity, Diamonds & Gemstones,
 * Jewellery Guides — force-opening each in turn, and dumps for every one:
 *
 *   - the full element tree (tag.class + own text), depth 7
 *   - every link's text and href, in document order
 *   - computed layout for each distinct class: width, display, grid tracks,
 *     gap, padding, margin, border, font-size, weight, letter-spacing, colour
 *   - both tab panes where a panel is tabbed
 *
 * Run it once on LIVE and once on the v3 preview, save each as JSON, and the
 * two diff directly — no eyeballing, no measuring screenshots. This is the
 * tool the layout smoke-test item on the outstanding list has been asking for.
 *
 * Usage:
 *   copy(JSON.stringify(dumpMegaMenus(), null, 1))
 * then paste into a file. `copy()` is a devtools built-in.
 */

function dumpMegaMenus() {
  const panels = [...document.querySelectorAll('.mega, [class*="mega"]')]
    .filter(e => e.querySelector('.mm__main, .mm-dg-cols, .mm__cols'));

  const seenPanel = new Set();
  const out = { href: location.href, viewport: innerWidth, panels: [] };

  const cls = (e) => {
    const c = e.getAttribute && e.getAttribute('class');
    return c ? c.trim().split(/\s+/).join('.') : '';
  };
  const px = (v) => (v === '0px' || v === 'normal' || v === 'none' ? undefined : v);

  for (const panel of panels) {
    if (seenPanel.has(panel)) continue;
    seenPanel.add(panel);

    // neutralise every display:none ancestor, and remember it
    const undo = [];
    let n = panel;
    while (n && n !== document.body) {
      if (getComputedStyle(n).display === 'none') { undo.push([n, n.style.display]); n.style.display = 'block'; }
      n = n.parentElement;
    }
    // and force BOTH tab panes visible so tab 2 is measurable too
    const panes = [...panel.querySelectorAll('.mm__tab-body')];
    const paneUndo = panes.map(p => [p, p.style.display]);
    panes.forEach(p => (p.style.display = 'block'));

    const styles = {};
    const tree = [];
    const links = [];
    const seenCls = new Set();

    const walk = (e, d) => {
      if (!e || d > 7) return;
      const k = cls(e) || e.tagName;
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      if (!seenCls.has(k)) {
        seenCls.add(k);
        styles[k] = {
          w: Math.round(r.width), h: Math.round(r.height),
          display: c.display,
          cols: px(c.gridTemplateColumns), rows: px(c.gridTemplateRows),
          flow: c.gridAutoFlow === 'row' ? undefined : c.gridAutoFlow,
          gap: px(c.gap), align: c.alignItems, justify: px(c.justifyContent),
          pad: px(c.padding), margin: px(c.margin),
          bt: px(c.borderTopWidth), bb: px(c.borderBottomWidth), bl: px(c.borderLeftWidth),
          fs: c.fontSize, fw: c.fontWeight, ls: px(c.letterSpacing),
          tt: c.textTransform === 'none' ? undefined : c.textTransform,
          lh: c.lineHeight, color: c.color
        };
      }
      const own = [...e.childNodes].filter(x => x.nodeType === 3)
        .map(x => x.textContent.replace(/\s+/g, ' ').trim()).join(' ').trim();
      tree.push('  '.repeat(d) + e.tagName.toLowerCase() + (cls(e) ? '.' + cls(e) : '') + (own ? '  "' + own + '"' : ''));
      if (e.tagName === 'A') {
        links.push({
          text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60),
          href: e.getAttribute('href'),
          img: (e.querySelector('img') || {}).src
        });
      }
      [...e.children].forEach(k2 => walk(k2, d + 1));
    };

    walk(panel, 0);

    const head = panel.closest('li, .has-mega');
    const trigger = head ? (head.querySelector('a, button') || {}).textContent : null;

    out.panels.push({
      trigger: trigger ? trigger.replace(/\s+/g, ' ').trim() : '(unknown)',
      linkCount: links.length,
      tree: tree.join('\n'),
      links,
      styles
    });

    paneUndo.forEach(([p, v]) => (p.style.display = v));
    undo.forEach(([e, v]) => (e.style.display = v));
  }
  return out;
}
