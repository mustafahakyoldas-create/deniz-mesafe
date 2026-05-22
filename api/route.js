// CommonJS — Vercel Node.js varsayılan modu (ESM uyumsuzluk sorunlarını önler)

// Modül bir kez yüklensin, sonraki çağrılarda cache'lensin (cold start sonrası hızlı)
let _seaRoute = null;
let _loadError = null;

function loadSearoute() {
  if (_seaRoute) return _seaRoute;
  if (_loadError) throw _loadError;

  try {
    const lib = require('searoute-ts');
    let fn = null;
    if (typeof lib === 'function') {
      fn = lib;
    } else if (lib && typeof lib.default === 'function') {
      fn = lib.default;
    } else if (lib && typeof lib.seaRoute === 'function') {
      fn = lib.seaRoute;
    } else if (lib && lib.default && typeof lib.default.default === 'function') {
      fn = lib.default.default;
    }
    if (typeof fn !== 'function') {
      const keys = (lib && typeof lib === 'object') ? Object.keys(lib).join(', ') : '(non-object)';
      throw new Error(`searoute-ts export bulunamadı. Modül tipi: ${typeof lib}. Anahtarlar: ${keys}`);
    }
    _seaRoute = fn;
    return fn;
  } catch (e) {
    _loadError = e;
    throw e;
  }
}

function feature(lng, lat) {
  return { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lng, lat] } };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================================
  // TEŞHİS MODU — /api/route?diagnostic=1
  // Vercel deploy'da neyin patladığını görmek için
  // ============================================================
  if (req.query && (req.query.diagnostic === '1' || req.query.diag === '1')) {
    const report = {
      timestamp: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      env: process.env.VERCEL_ENV || 'unknown',
    };

    // 1. searoute-ts yüklenebilir mi?
    try {
      const lib = require('searoute-ts');
      report.requireOk = true;
      report.libType = typeof lib;
      if (lib && typeof lib === 'object') {
        report.libKeys = Object.keys(lib);
        report.hasDefault = typeof lib.default;
        report.hasSeaRoute = typeof lib.seaRoute;
      }
    } catch (e) {
      report.requireOk = false;
      report.requireError = String(e && e.message || e);
      report.requireStack = String(e && e.stack || '').split('\n').slice(0, 6).join(' || ');
      return res.status(200).json(report);
    }

    // 2. Fonksiyon çağrılabiliyor mu?
    try {
      const fn = loadSearoute();
      report.exportResolved = true;
      report.exportType = typeof fn;
    } catch (e) {
      report.exportResolved = false;
      report.exportError = String(e && e.message || e);
      return res.status(200).json(report);
    }

    // 3. Test rotası: Santos (BR) → Mersin (TR)
    try {
      const fn = loadSearoute();
      const r = fn(feature(-46.33, -23.93), feature(34.63, 36.80));
      report.testOk = true;
      report.testCoordCount = r && r.geometry && r.geometry.coordinates && r.geometry.coordinates.length;
      report.testLength = r && r.properties && r.properties.length;
      report.testUnits = r && r.properties && r.properties.units;
    } catch (e) {
      report.testOk = false;
      report.testError = String(e && e.message || e);
      report.testStack = String(e && e.stack || '').split('\n').slice(0, 6).join(' || ');
    }

    return res.status(200).json(report);
  }

  // ============================================================
  // NORMAL ROTA HESAPLAMA
  // ============================================================
  try {
    const q = (req.method === 'POST') ? (req.body || {}) : (req.query || {});
    const fromLat = parseFloat(q.fromLat);
    const fromLng = parseFloat(q.fromLng);
    const toLat = parseFloat(q.toLat);
    const toLng = parseFloat(q.toLng);

    if ([fromLat, fromLng, toLat, toLng].some(Number.isNaN)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz koordinat. fromLat, fromLng, toLat, toLng zorunlu.',
      });
    }

    let seaRoute;
    try {
      seaRoute = loadSearoute();
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: 'searoute-ts yüklenemedi: ' + String(e && e.message || e),
        hint: 'Detay için /api/route?diagnostic=1 adresini açın',
      });
    }

    let route;
    try {
      route = seaRoute(feature(fromLng, fromLat), feature(toLng, toLat));
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: 'Rota hesaplama hatası: ' + String(e && e.message || e),
        hint: 'Detay için /api/route?diagnostic=1 adresini açın',
      });
    }

    if (!route || !route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length < 2) {
      return res.status(500).json({
        success: false,
        error: 'Boş rota döndü (kütüphane sonuç üretmedi)',
      });
    }

    return res.status(200).json({
      success: true,
      coordinates: route.geometry.coordinates,
      length: (route.properties && route.properties.length) || null,
      units: (route.properties && route.properties.units) || 'nauticalmiles',
    });
  } catch (e) {
    console.error('Route API genel hata:', e);
    return res.status(500).json({
      success: false,
      error: String(e && e.message || e),
    });
  }
};
