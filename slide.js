/* Costruisce le slide (.pptx) nello stile di Studio Ripasso: ogni testo è una casella modificabile in Canva/PowerPoint */
(function (radice) {
  'use strict';
  var FONT = 'Trebuchet MS';
  function hex(c) { return String(c).replace('#', '').toUpperCase(); }
  function scuro(c, f) { // schiarisce/scurisce un colore esadecimale
    var n = parseInt(hex(c), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function k(x) { return Math.max(0, Math.min(255, Math.round(x * f))); }
    return ((1 << 24) + (k(r) << 16) + (k(g) << 8) + k(b)).toString(16).slice(1).toUpperCase();
  }

  function costruisci(PptxGenJS, d, materia, numero, colore) {
    var M = scuro(colore, 0.82), P = new PptxGenJS();
    P.layout = 'LAYOUT_16x9'; // 10 x 5.625 pollici
    P.title = materia + ' - ' + d.titolo;
    var tot = 4 + (d.colonne || []).length, n = 0;
    var T = { fontFace: FONT, valign: 'middle', margin: 0.05 };

    function nuova(titolo) {
      var s = P.addSlide(); n++;
      s.background = { color: 'FBF6EA' };
      s.addShape(P.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: 5.625, fill: { color: M }, line: { color: M } });
      s.addText(titolo, Object.assign({}, T, { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 28, bold: true, color: M }));
      s.addText(n + ' / ' + tot, Object.assign({}, T, { x: 8.6, y: 5.2, w: 1.2, h: 0.3, fontSize: 10, bold: true, color: 'A8957A', align: 'right' }));
      return s;
    }

    // 1 · titolo
    var s = P.addSlide(); n++;
    s.background = { color: M };
    s.addText(d.titolo, Object.assign({}, T, { x: 0.6, y: 1.5, w: 8.8, h: 1.4, fontSize: 38, bold: true, color: 'FFFFFF', align: 'center' }));
    s.addText(d.sottotitolo, Object.assign({}, T, { x: 0.6, y: 2.95, w: 8.8, h: 0.6, fontSize: 18, color: 'FFFFFF', align: 'center' }));
    s.addText(materia + ' · Esposizione di Nome Cognome', Object.assign({}, T, { x: 2.6, y: 3.9, w: 4.8, h: 0.5, fontSize: 14, bold: true,
      color: '3A2D00', align: 'center', shape: P.ShapeType.roundRect, rectRadius: 0.25, fill: { color: 'E8B93A' } }));

    // 2 · quadro generale (mappa a nodi)
    s = nuova('Il quadro generale');
    var cx = 5, cy = 3.35, pos = [[2, 2.2], [8, 2.2], [2, 4.5], [8, 4.5]];
    var cols = [M, 'E8B93A', scuro(colore, 0.62), 'DB5742'], txc = ['FFFFFF', '3A2D00', 'FFFFFF', 'FFFFFF'];
    pos.forEach(function (p) {
      s.addShape(P.ShapeType.line, { x: Math.min(cx, p[0]), y: Math.min(cy, p[1]), w: Math.abs(p[0] - cx), h: Math.abs(p[1] - cy),
        flipH: false, flipV: (p[0] - cx) * (p[1] - cy) < 0, line: { color: 'CD9A0D', width: 2 } });
    });
    s.addText(d.centro, Object.assign({}, T, { x: cx - 1.3, y: cy - 0.4, w: 2.6, h: 0.8, fontSize: 18, bold: true, color: 'FFFFFF',
      align: 'center', shape: P.ShapeType.roundRect, rectRadius: 0.15, fill: { color: '3D2A14' } }));
    d.nodi.forEach(function (t, i) {
      s.addText(t, Object.assign({}, T, { x: pos[i][0] - 1.2, y: pos[i][1] - 0.35, w: 2.4, h: 0.7, fontSize: 15, bold: true, color: txc[i],
        align: 'center', shape: P.ShapeType.roundRect, rectRadius: 0.15, fill: { color: cols[i] } }));
    });

    // 3 · due colonne (una o più slide)
    (d.colonne || []).forEach(function (c) {
      var sl = nuova(c.titolo_slide);
      [c.a, c.b].forEach(function (col, i) {
        var x = 0.5 + i * 4.6;
        sl.addShape(P.ShapeType.roundRect, { x: x, y: 1.3, w: 4.3, h: 3.6, rectRadius: 0.12, fill: { color: 'FFFFFF' }, line: { color: 'CD9A0D', width: 2 } });
        sl.addText(col.titolo, Object.assign({}, T, { x: x, y: 1.3, w: 4.3, h: 0.6, fontSize: 18, bold: true, color: 'FFFFFF',
          shape: P.ShapeType.roundRect, rectRadius: 0.12, fill: { color: M } }));
        sl.addText(col.voci.map(function (v) { return { text: v, options: { bullet: true, breakLine: true } }; }),
          Object.assign({}, T, { x: x + 0.15, y: 2.05, w: 4.0, h: 2.7, fontSize: 15, color: '3D2A14', valign: 'top', paraSpaceAfter: 8 }));
      });
    });

    // 4 · numero grande
    s = nuova(d.numero.titolo);
    s.addShape(P.ShapeType.roundRect, { x: 0.5, y: 1.5, w: 3.4, h: 2.8, rectRadius: 0.15, fill: { color: 'E8B93A' }, line: { color: 'E8B93A' } });
    s.addText(d.numero.valore, Object.assign({}, T, { x: 0.5, y: 1.8, w: 3.4, h: 1.4, fontSize: 54, bold: true, color: '3A2D00', align: 'center' }));
    s.addText(d.numero.etichetta, Object.assign({}, T, { x: 0.6, y: 3.2, w: 3.2, h: 0.8, fontSize: 14, bold: true, color: '3A2D00', align: 'center' }));
    s.addText(d.numero.testo, Object.assign({}, T, { x: 4.3, y: 1.5, w: 5.2, h: 1.7, fontSize: 17, color: '3D2A14', valign: 'top' }));
    (d.numero.chips || []).forEach(function (c, i) {
      s.addText(c, Object.assign({}, T, { x: 4.3 + i * 1.75, y: 3.5, w: 1.65, h: 0.5, fontSize: 11, bold: true, color: '3D2A14', align: 'center',
        shape: P.ShapeType.roundRect, rectRadius: 0.25, fill: { color: 'FFFFFF' }, line: { color: 'CD9A0D', width: 1.5 } }));
    });

    // 5 · da ricordare
    s = nuova('Da ricordare');
    d.ricorda.forEach(function (v, i) {
      s.addText(String(i + 1), Object.assign({}, T, { x: 0.6, y: 1.3 + i * 0.85, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center',
        shape: P.ShapeType.ellipse, fill: { color: M } }));
      s.addText(v, Object.assign({}, T, { x: 1.4, y: 1.25 + i * 0.85, w: 8, h: 0.7, fontSize: 18, color: '3D2A14' }));
    });
    s.addText([{ text: 'Domanda alla classe: ', options: { bold: true, color: 'E8B93A' } }, { text: d.domanda_classe, options: { color: 'FFFFFF' } }],
      Object.assign({}, T, { x: 0.6, y: 4.2, w: 8.8, h: 0.85, fontSize: 16, shape: P.ShapeType.roundRect, rectRadius: 0.12, fill: { color: '3D2A14' } }));
    return P;
  }

  var api = { costruisci: costruisci };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else radice.ripassoSlide = api;
})(typeof window !== 'undefined' ? window : this);
