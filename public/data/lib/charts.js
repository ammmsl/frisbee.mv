/* charts.js — Tufte-tuned chart archetypes for the UFA report system.
 * Depends on vendored d3 (window.d3) + Observable Plot (window.Plot), loaded before this file.
 * Every archetype: max data-ink, faint grid, no frame/chartjunk, direct labels over legends,
 * shared scales for small multiples, honest uncertainty bands, tabular-num mono ticks.
 *
 *   UFA.bars(el, data, {x, y, fx, fy, sort})        // bar / small-multiple bars
 *   UFA.line(el, series, {x, y, band, labelEnd})    // line(s) + optional CI band + end label
 *   UFA.dots(el, data, {x, y, fy})                  // dot / strip plot
 *   UFA.sparkline(el, values, {width,height})       // inline SVG data-word
 *   UFA.network(el, {nodes, links}, {labelTop})     // d3-force @-mention graph
 *   UFA.palette / UFA.tokens()                      // categorical scale from report.css
 */
(function (global) {
  "use strict";
  const CSS = getComputedStyle(document.documentElement);
  const T = (name, fallback) => (CSS.getPropertyValue(name).trim() || fallback);
  const tokens = () => ({
    ink: T("--ink", "#10242B"), soft: T("--ink-soft", "#3C525A"),
    muted: T("--muted", "#6E828A"), line: T("--line", "#D8E0DE"),
    grid: T("--grid", "#E7ECEA"), accent: T("--accent", "#0E7C86"),
    scale: ["--c1","--c2","--c3","--c4","--c5","--c6"].map((v,i)=>T(v,["#0E7C86","#3F6C8E","#B07B23","#C0492E","#6D5AA6","#2E7D5B"][i])),
    mono: T("--font-mono", "monospace"),
  });
  const PAL = tokens();

  function need() {
    if (!global.Plot || !global.d3) { console.warn("charts.js: d3 + Observable Plot must load first"); return false; }
    return true;
  }
  function mount(el, node) {
    const box = typeof el === "string" ? document.querySelector(el) : el;
    box.innerHTML = ""; box.classList.add("plot"); box.append(node); return node;
  }
  // Tufte-default Plot options: transparent, mono, faint y-grid only, no frame.
  function base(opts) {
    return Object.assign({
      style: { background: "transparent", color: PAL.ink, fontFamily: PAL.mono, fontSize: "12px", overflow: "visible" },
      marginLeft: 52, marginBottom: 34, marginTop: 12, marginRight: 16,
      color: { range: PAL.scale },
    }, opts);
  }

  const UFA = {
    palette: PAL.scale,
    tokens,

    /* Bars, with optional fx/fy facets = small multiples on a shared scale. */
    bars(el, data, o = {}) {
      if (!need()) return;
      const { x, y, fx, fy, sort, label = false, tickFormat } = o;
      const marks = [
        Plot.barY(data, { x, y, fx, fy, fill: o.fill || PAL.accent, sort, tip: true }),
        Plot.ruleY([0], { stroke: PAL.line }),
      ];
      if (label) marks.push(Plot.text(data, { x, y, fx, fy, text: (d) => d[y], dy: -6, fontVariant: "tabular-nums", fill: PAL.soft }));
      return mount(el, Plot.plot(base({
        x: { label: null, tickRotate: o.rotate || 0 },
        y: { grid: true, label: o.yLabel ?? null, tickFormat, nice: true },
        fx: fx ? { label: null } : undefined, fy: fy ? { label: null } : undefined,
        height: o.height || (fy ? 260 : 300), width: o.width,
        marks,
      })));
    },

    /* Line(s). band:[loKey,hiKey] draws an honest CI/uncertainty area. labelEnd puts the
       series name at the last point (direct labelling — no legend).
       For date-like x, pass Date objects and xType:"time" (auto-thins ticks; avoids Plot's
       point-scale date warning). */
    line(el, series, o = {}) {
      if (!need()) return;
      const { x, y, z, band, labelEnd = true, stroke } = o;
      const marks = [];
      if (band) marks.push(Plot.areaY(series, { x, y1: band[0], y2: band[1], fill: stroke || PAL.accent, fillOpacity: 0.14, z }));
      marks.push(Plot.ruleY([0], { stroke: PAL.line }));
      marks.push(Plot.lineY(series, { x, y, z, stroke: z ? z : (stroke || PAL.accent), strokeWidth: 1.75, curve: o.curve || "linear" }));
      if (labelEnd) {
        const last = d3.groups(series, d => z ? d[z] : "_").map(([k, v]) => v[v.length - 1]);
        marks.push(Plot.text(last, { x, y, text: d => z ? d[z] : (o.endText || ""), dx: 6, textAnchor: "start", fill: PAL.soft, fontVariant: "tabular-nums" }));
      }
      return mount(el, Plot.plot(base({
        x: { label: o.xLabel ?? null, tickFormat: o.xFormat, type: o.xType },
        y: { grid: true, label: o.yLabel ?? null, nice: true, tickFormat: o.yFormat },
        color: z ? { range: PAL.scale, legend: false } : undefined,
        marginRight: labelEnd ? 64 : 16,
        height: o.height || 300, width: o.width,
        marks,
      })));
    },

    /* Dot / strip plot; fy = one row per category (small multiples). */
    dots(el, data, o = {}) {
      if (!need()) return;
      const { x, y, fy, fill } = o;
      return mount(el, Plot.plot(base({
        x: { grid: true, label: o.xLabel ?? null, nice: true },
        y: y ? { label: null } : undefined, fy: fy ? { label: null } : undefined,
        height: o.height || 300, width: o.width,
        marks: [Plot.dot(data, { x, y, fy, fill: fill || PAL.accent, r: o.r || 3.2, fillOpacity: .8, tip: true })],
      })));
    },

    /* Inline SVG sparkline — a data-word for prose. values = number[]. */
    sparkline(el, values, o = {}) {
      const w = o.width || 90, h = o.height || 20, p = 2;
      const box = typeof el === "string" ? document.querySelector(el) : el;
      const n = values.length, mn = Math.min(...values), mx = Math.max(...values), sp = (mx - mn) || 1;
      const X = i => p + (i / (n - 1)) * (w - 2 * p);
      const Y = v => h - p - ((v - mn) / sp) * (h - 2 * p);
      const d = values.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
      const NS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "spark"); svg.setAttribute("width", w); svg.setAttribute("height", h); svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", d); path.setAttribute("fill", "none");
      path.setAttribute("stroke", o.color || PAL.accent); path.setAttribute("stroke-width", "1.25");
      svg.append(path);
      const dot = document.createElementNS(NS, "circle");            // emphasise the endpoint (Tufte)
      dot.setAttribute("cx", X(n - 1)); dot.setAttribute("cy", Y(values[n - 1])); dot.setAttribute("r", "1.8");
      dot.setAttribute("fill", o.color || PAL.accent); svg.append(dot);
      box.append(svg); return svg;
    },

    /* Force-directed @-mention network. nodes:[{id,group,degree?}], links:[{source,target,value?}].
       Colours by group; direct-labels only the top-labelTop nodes by degree (not all — Tufte). */
    network(el, graph, o = {}) {
      if (!need()) return;
      const box = typeof el === "string" ? document.querySelector(el) : el;
      box.innerHTML = ""; box.classList.add("plot");
      const w = o.width || box.clientWidth || 640, h = o.height || 460, labelTop = o.labelTop ?? 8;
      const groups = Array.from(new Set(graph.nodes.map(n => n.group)));
      const color = g => PAL.scale[groups.indexOf(g) % PAL.scale.length];
      const deg = {}; graph.links.forEach(l => { deg[l.source] = (deg[l.source]||0)+1; deg[l.target] = (deg[l.target]||0)+1; });
      const nodes = graph.nodes.map(n => Object.assign({}, n, { r: o.r || (4 + Math.sqrt(deg[n.id] || 1)) }));
      const links = graph.links.map(l => Object.assign({}, l));
      // Label only MEANINGFUL nodes (committee roles / names), not bare opaque ids
      // ("n123" is noise and just piles up in the dense core) — plus the single
      // most-central node as an anchor. Node size already encodes degree.
      const byDeg = nodes.slice().sort((a, b) => (deg[b.id]||0) - (deg[a.id]||0));
      const isOpaque = s => !s || /^n\d+$/.test(s);
      const topSet = new Set(nodes.filter(d => d.label && !isOpaque(d.label)).map(d => d.id));
      // opt-in only: adding the bare most-central opaque node just clutters the core
      if (o.labelTopDegree === true && byDeg[0]) topSet.add(byDeg[0].id);
      const svg = d3.create("svg").attr("width", w).attr("height", h).attr("viewBox", [0, 0, w, h])
        .attr("style", "max-width:100%;height:auto;overflow:visible;font-family:" + PAL.mono);
      const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(o.distance || 42).strength(.5))
        .force("charge", d3.forceManyBody().strength(o.charge || -90))
        .force("center", d3.forceCenter(w / 2, h / 2))
        // labelled nodes claim extra space so their text doesn't collide with neighbours
        .force("collide", d3.forceCollide().radius(d => d.r + (topSet.has(d.id) ? 16 : 2)));
      const link = svg.append("g").attr("stroke", PAL.line).attr("stroke-opacity", .6)
        .selectAll("line").data(links).join("line").attr("stroke-width", d => Math.sqrt(d.value || 1));
      const node = svg.append("g").attr("stroke", "#fff").attr("stroke-width", 1)
        .selectAll("circle").data(nodes).join("circle").attr("r", d => d.r).attr("fill", d => color(d.group))
        .call(d3.drag()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
      node.append("title").text(d => d.label || d.group);
      // white halo (paint-order:stroke) keeps labels legible even where they do overlap
      const labels = svg.append("g").attr("fill", PAL.soft).attr("font-size", 11)
        .attr("paint-order", "stroke").attr("stroke", "#fff").attr("stroke-width", 3).attr("stroke-linejoin", "round")
        .selectAll("text").data(nodes.filter(d => topSet.has(d.id) && d.label)).join("text")
        .attr("dx", d => d.r + 3).attr("dy", 4).text(d => d.label);
      sim.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("cx", d => d.x).attr("cy", d => d.y);
        labels.attr("x", d => d.x).attr("y", d => d.y);
      });
      box.append(svg.node()); return svg.node();
    },
  };

  global.UFA = UFA;
})(window);
