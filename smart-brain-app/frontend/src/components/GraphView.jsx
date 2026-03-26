import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';

const TYPE_COLOR = {
  article: '#3b82f6', youtube: '#ef4444', tweet: '#06b6d4',
  image: '#10b981', pdf: '#f97316', note: '#8b5cf6', link: '#64748b', tag: '#7c3aed',
};
const LEGEND = Object.entries(TYPE_COLOR).filter(([t]) => t !== 'tag');

export default function GraphView({ data }) {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!data?.nodes?.length) return;

    const el = svgRef.current;
    const width  = el.clientWidth  || 900;
    const height = el.clientHeight || 600;

    const svg = d3.select(el);
    svg.selectAll('*').remove();

    // Defs — glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    // Zoom + pan
    const zoom = d3.zoom().scaleExtent([0.08, 5]).on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom).on('dblclick.zoom', null);

    // Clone nodes/links to avoid D3 mutating original data
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force('link',  d3.forceLink(links).id(d => d.id).distance(d => d.target?.group === 'tag' ? 70 : 120).strength(0.5))
      .force('charge', d3.forceManyBody().strength(d => d.group === 'tag' ? -80 : -220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.group === 'tag' ? 18 : 32));

    // Links
    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', 'rgba(255,255,255,0.07)')
      .attr('stroke-width', 1.2);

    // Node groups
    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Circles
    node.append('circle')
      .attr('r', d => d.group === 'tag' ? 10 : 20)
      .attr('fill', d => TYPE_COLOR[d.type] || TYPE_COLOR.tag)
      .attr('fill-opacity', 0.88)
      .attr('stroke', d => TYPE_COLOR[d.type] || TYPE_COLOR.tag)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .attr('filter', 'url(#glow)');

    // Labels
    node.append('text')
      .text(d => d.label?.slice(0, 18) || '')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.group === 'tag' ? 22 : 33)
      .attr('fill', 'rgba(255,255,255,0.65)')
      .attr('font-size', d => d.group === 'tag' ? 9 : 10)
      .attr('font-family', 'Inter, sans-serif')
      .attr('pointer-events', 'none');

    // Hover + click
    node
      .on('mouseover', function (_, d) {
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('r', d.group === 'tag' ? 14 : 26)
          .attr('fill-opacity', 1);
      })
      .on('mouseout', function (_, d) {
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('r', d.group === 'tag' ? 10 : 20)
          .attr('fill-opacity', 0.88);
      })
      .on('click', (_, d) => {
        if (d.group === 'item' && d.id) {
          if (data.itemUrl) window.open(data.itemUrl, '_blank');
        }
      });

    // Tick
    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => sim.stop();
  }, [data]);

  return (
    <div className="graph-container" id="graph-canvas-wrapper">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div className="graph-legend">
        {LEGEND.map(([type, color]) => (
          <div key={type} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {type}
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-dot" style={{ background: TYPE_COLOR.tag }} />
          tag
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        fontSize: 11, color: 'var(--text-muted)',
        background: 'rgba(7,7,15,0.8)', padding: '6px 12px',
        borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
        backdropFilter: 'blur(8px)',
      }}>
        Scroll to zoom · Drag to move
      </div>
    </div>
  );
}
