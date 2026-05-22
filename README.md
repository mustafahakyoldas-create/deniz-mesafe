# Deniz Mesafe Hesaplayıcı — Vercel Deploy Rehberi

## Bu projede ne var?

- `index.html` — Kullanıcı arayüzü (harita + liman seçimi)
- `api/route.js` — Sunucu tarafı kod (gerçek deniz rotası hesaplar)
- `package.json` — Bağımlılıklar listesi
- `.gitignore` — Versiyon kontrolü için ayar

## Yayına alma (toplam ~10 dakika)

### Adım 1: GitHub hesabı aç (varsa atla)

1. **github.com** adresine git
2. Sağ üstte **"Sign up"** butonu → e-posta ile kayıt ol
3. Doğrulama e-postasını onayla

### Adım 2: Yeni bir repository oluştur

1. GitHub'a giriş yaptıktan sonra sağ üstte **"+"** simgesi → **"New repository"**
2. **Repository name**: `deniz-mesafe` (veya istediğin isim)
3. **Public** seçeneğini bırak
4. **"Create repository"** butonuna bas

### Adım 3: Dosyaları yükle

Açılan sayfada **"uploading an existing file"** bağlantısına tıkla. Sonra:

1. Bu zip dosyasını masaüstüne çıkar (sağ tıkla → Tümünü Çıkar)
2. Çıkan klasörün **içindeki** dosyaları (dosyaları kendisini değil, içindekileri) sürükleyip GitHub sayfasına bırak
3. Aşağıda **"Commit changes"** butonuna bas

⚠️ **Önemli:** `node_modules` klasörü varsa onu yükleme. `.gitignore` zaten engelliyor ama olur olmaz.

### Adım 4: Vercel hesabı aç

1. **vercel.com** adresine git
2. **"Sign Up"** butonu
3. **"Continue with GitHub"** seç (GitHub'la giriş yap, izin ver)

### Adım 5: Projeyi Vercel'e bağla

1. Vercel ana sayfasında **"Add New..."** → **"Project"**
2. GitHub repo listenden **deniz-mesafe** projesini bul, yanındaki **"Import"** butonuna bas
3. Açılan sayfada hiçbir şey değiştirmeden **"Deploy"** butonuna bas
4. ~2 dakika bekle (kahve içme zamanı ☕)

### Adım 6: Test et

Deploy bitince Vercel sana bir URL verecek (örnek: `https://deniz-mesafe-abc123.vercel.app`).

1. Bu URL'yi tarayıcıda aç → uygulama gelmeli
2. **Mersin → Santos** dene, "Mesafeyi Hesapla" bas

### Hata mı geldi? Teşhis modu

URL'nin sonuna `/api/route?diagnostic=1` ekleyerek aç. Örnek:

```
https://deniz-mesafe-abc123.vercel.app/api/route?diagnostic=1
```

Çıkan JSON çıktısını paylaş, hangi adımda patladığını bulabilelim.

## Daha sonra değişiklik yapmak

GitHub'daki dosyaları düzenlersen (web arayüzünden), Vercel otomatik olarak 1-2 dakika içinde yeni sürümü yayına alır. Komut satırı, terminal hiçbir şey gerekmez.

## Domain bağlamak

Vercel'in verdiği URL `*.vercel.app` ile bitiyor. Kendi domain'ini bağlamak için:
1. Vercel projende **Settings → Domains**
2. Domain adını yaz, DNS ayarlarını yapmak için yönergeler ekrana gelir

Ücretsiz tier'da custom domain destekleniyor.
