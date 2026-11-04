const fs = require('fs');
let s = fs.readFileSync('src/admin/pages/Dashboard.jsx', 'utf8');
let lines = s.split('\n');
const startIdx = lines.findIndex(l => l.includes('const load = () => {'));
const endIdx = lines.findIndex(l => l.trim() === '}', startIdx) + 1;
if (startIdx === -1 || endIdx === -1) { console.log('load function not found'); process.exit(1); }
const newLoad = [
  '  const load = () => {',
  '    setLoading(true);',
  '    const seg = window.segment || localStorage.getItem(\'adminSegment\') || \'all\';',
  '    const tryPath = () => {',
  '      fetch(\'/api/admin/stats\' + (seg === \'all\' ? \'\' : \'/\' + seg), { headers: { Authorization: \'Bearer \' + token } })',
  '        .then(r => { if (r.status === 404) return null; return r.json(); })',
  '        .then(data => { if (data && data.error) throw new Error(data.error); setStats(data); setError(\'\'); })',
  '        .catch(() => get(\'/api/admin/stats\'))',
  '        .catch(err => setError(err.message || \'Could not load dashboard statistics\'));',
  '    };',
  '    tryPath();',
  '    setInterval(tryPath, 30000);',
  '  };',
  '',
  '  useEffect(() => { load(); }, []);
'
].join('\n');
lines.splice(startIdx, endIdx - startIdx, newLoad);
fs.writeFileSync('src/admin/pages/Dashboard.jsx', lines.join('\n'), 'utf8');
console.log('patched, total lines:', lines.length);
