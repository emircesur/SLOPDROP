# SLOPDROP — Tasarım ve Fikir Dokümanı

> **Sürüm** 0.1 · **Durum** kurucu doküman, uygulamadan önce yazıldı · **Kapsam** ürün tezi, kanıt, taksonomi, ölçüm, protokol, mimari, marka, yol haritası
>
> Bu doküman Türkçe. Depoya giren ürün dosyaları (README, SKILL.md, referanslar, kod) İngilizce, çünkü ajanlar ve kullanıcılar için yayınlanan yüzey orası. Buradaki kararlar o yüzeyin gerekçesi.

---

## 0. Nasıl okunmalı

Bu bir tanıtım metni değil. Bir ürünün neden böyle göründüğünü, neden bu sırayla inşa edildiğini ve neyi yapmayı reddettiğini anlatan bir mühendislik dokümanı.

Üç soruya cevap verir:

1. **Neyle savaşıyoruz?** Slop'un tanımı, katmanları ve ölçülebilir belirtileri.
2. **Neye göre karar veriyoruz?** 5 milyon uygulama yorumundan çıkan kanıt ve altı boyutlu puanlama.
3. **Nasıl inşa ediyoruz?** Kural kataloğu, dedektör, ajan protokolü, yerel-öncelikli SQLite beyin ve bunların repo mimarisi.

Bir özellik fikri bu dokümandaki bir ilkeye dayanmıyorsa, özellik değil tercihtir. Tercihler de olabilir; ama tercih olduğunu söylemek zorunda.

---

## 1. Ürün, tek paragrafta

SLOPDROP, yapay zekânın ürettiği arayüzlerdeki jenerikliği bulur, açıklar ve düzeltir. Mobil, web, masaüstü ve mekânsal (VR/XR) yüzeylerde çalışır; metni de kapsar çünkü arayüzün yarısı cümledir. Üç parçadan oluşur:

- **Protokol.** Herhangi bir kodlama ajanının yükleyebileceği bir beceri: incele, teşhis et, yön belirle, tedavi et, doğrula, kaydet.
- **Dedektör.** Model, ağ ve bağımlılık olmadan kaynak kodu okuyan deterministik bir kural motoru.
- **Beyin.** Proje başına tek bir SQLite veritabanı; Claude Desktop, Google Antigravity ve OpenAI Codex aynı projede aynı bağlamı görsün diye MCP üzerinden paylaşılır.

Üçü aynı kural kataloğunu okur. Kural kataloğu veridir; motor, beceri ve sunucu onun okuyucularıdır.

**Tek cümle:** *Slop'u isimlendir, kanıtla, ölç ve ürünün kendi karakterine geri döndür.*

**Karşı cümle:** *AI ile üretilmiş her şeyi sil.* Hayır. SLOPDROP bir zevk polisi değil, bir jeneriklik dedektörü. İyi üretilmiş, karakterli, doğru söyleyen bir arayüze dokunmaz.

---

## 2. Problem

### 2.1 Slop nedir

Slop, kötü tasarım değildir. Kötü tasarım bile bir karar taşır. Slop, karar taşımayan tasarımdır: her ürüne uyabilecek kadar genel, hiçbir ürüne ait olmayacak kadar nötr, çoğu zaman da söylediği şey doğru olmayan arayüz.

Üç eksende ölçülür:

| Eksen | Belirti | Kullanıcıya maliyeti |
|---|---|---|
| **Jeneriklik** | Logo kapatıldığında ekranın hangi ürüne ait olduğu anlaşılmıyor | Ürün hatırlanmıyor, güven oluşmuyor |
| **Doğrusuzluk** | Uydurma istatistik, "10.000+ ekip güveniyor", boş hata mesajı, yüklenemedi yerine "kayıt yok" | Kullanıcı yanlış karar veriyor |
| **Sürtünme** | Taşınmış buton, görev ortasında popup, klavye altında kalan input, donan liste | Kullanıcı görevi bitiremiyor |

Bu üçü birbirinden bağımsızdır. Güzel ama yalancı bir ekran slop'tur. Çirkin ama dürüst ve hızlı bir ekran slop değildir. SLOPDROP önce sürtünmeye, sonra doğruya, en son estetiğe bakar. Sıra keyfî değil; bölüm 4'teki veriden geliyor.

### 2.2 Neden oluyor

**Model varsayılanları.** Dil modelleri en olası tasarımı üretir. En olası tasarım, eğitim verisindeki en yaygın tasarımdır. Yaygın olan, ait olan değildir. Model bir ekranı üretirken "bu ürüne özgü ne var?" sorusunu sormaz; "bu türden bir ekran nasıl görünür?" sorusuna cevap verir.

**Şablon çekimi.** Flutter `Colors.deepPurple`, Android Studio `Purple40`, Expo starter'ın `ParallaxScrollView`'ı, shadcn'in dokunulmamış `rounded-lg border shadow-sm` kartı. Şablon, kararı verir; geliştirici kararı onaylar sanır.

**Ölçüsüz tasarım.** Ekipler "daha modern görünsün" der; kimse "hangi görev hızlandı?" diye sormaz. Ölçüt olmayınca estetik, modaların ortalamasına yakınsar.

**Ajan döngüsü.** Ajan bir ekranı üretir, aynı ajan onu beğenir, aynı ajan düzeltir. Üç aşamada da aynı varsayılanlar baskındır. Taze göz yoksa slop kendini doğrular.

**Ekran görüntüsü kültürü.** Tasarım, çalışan üründen değil ekran görüntüsünden değerlendirilir. Oysa kullanıcıların şikayet ettiği şeylerin çoğu (gecikme, taşınan buton, görev ortasında popup, yanlış veri) statik görüntüde görünmez.

**Yeni slop, eski slop'tan daha zor.** 2023'ün mor gradyanı kolay tanınır ve çoğu model ondan kaçınmayı öğrendi. Yerine gelen "tasteful default" daha zor: beyaz kartlar, ince gri kenarlıklar, tek mavi vurgu, her satırda tinted kare içinde ikon, her etiketin yanında renkli nokta, bol boşluk. Temiz görünür, sakin görünür, gene jeneriktir. Bir tedavi buraya iniyorsa, bir şablonu başka bir şablonla değiştirmiştir.

### 2.3 2026 manzarası

Slop artık tek bir estetik değil, dört ayrı yüzeyde dört ayrı biçimde görünüyor:

- **Metin slop'u:** "It's not X. It's Y.", "What nobody tells you", iki nokta üstüste ile dramatik açıklama, sahte derin kapanış, "seamless", "leverage", "unlock your potential".
- **Arayüz slop'u:** mor gradyan, cam efektli her yüzey, iç içe kartlar, emoji ikon, uydurma stat, "Oops! Something went wrong", mobil uygulamada web sitesi (hamburger menü, hero, footer).
- **Mekânsal slop:** kafaya kilitlenmiş HUD, her yerde parlayan cam panel, 1°'nin altında metin, zorunlu smooth locomotion, passthrough üstünde beyaz yazı, iki boyutlu web sayfasının boşlukta yüzmesi.
- **Ajan slop'u:** her yere "Ask AI" butonu, arama yerine sparkle, görev ortasında AI önerisi, kapatılamayan asistan balonu, "Powered by AI" rozeti, üretilmiş ama doğrulanmamış içerik.

Dördü de aynı hatayı yapar: ürünün ne olduğunu sormadan, türün ortalamasını üretir.

### 2.4 Mevcut araçlar neden yetmiyor

| Araç | Ne yapar | Neyi kaçırır |
|---|---|---|
| Linter / tip denetimi | Kod doğruluğu | Tasarım kararı, kopya, his |
| Lighthouse / a11y tarayıcı | Erişilebilirlik tabanı, performans metrikleri | Görev akışı, jeneriklik, doğrusuzluk |
| Tasarım kritiği (insan) | Bağlam ve zevk | Ölçek, tutarlılık, tekrar edilebilirlik, kayıt |
| AI içerik dedektörleri | "AI mı yazdı?" tahmini | Kanıt; yanlış pozitif; asıl soru bu değil |
| Stil rehberi | Neyin doğru olduğunu söyler | Uygulanıp uygulanmadığını ölçmez |
| Ekran görüntüsü estetiği | Görsel tutarlılık | Çalışan ürünü, durumları, performansı |

Boşluk şurada: **isimlendirilmiş, tekrar edilebilir, kanıtlanabilir ve ürüne özgü** bir inceleme. SLOPDROP bu boşluğu doldurur.

---

## 3. Tez: yedi ilke

1. **Sürtünme estetikten önce gelir.** Kullanıcı butonu bulamıyorsa gradyan tartışması lüks. Her rapor önce görevi, doğruyu ve durumları, sonra rengi konuşur.
2. **Doğru söylemeyen güzel, slop'tur.** Uydurma metrik, sahte sosyal kanıt, nedensiz hata mesajı: bunlar estetik değil, dürüstlük sorunudur ve en yüksek önceliği alır.
3. **Yerel olan, elle yapılandan iyidir.** Platformun kendi butonu, listesi, sheet'i, dialogu, focus halkası. Taklit, marka taşımıyorsa borçtur.
4. **İçerik süslemeden önce gelir.** Kullanıcının geldiği şey (siparişler, mesajlar, bölgeler) ekranın en çok yerini ve en güçlü tipografisini alır. Karşılama cümlesi ve bölüm etiketi daha az alır.
5. **Deterministik olan, ikna edicidir.** Aynı kod aynı çıktıyı verir. Bir bulgu, dosya ve satır ile gösterilebilir. Modelin "bence"si rapora girmez; kanıt girer.
6. **Kanıt, zevkten önce gelir.** Kural, bir kullanıcı şikayetinden veya platform yönergesinden gelir. Gelmiyorsa varsayım olarak işaretlenir.
7. **Küçük diff, büyük yeniden tasarımdan iyidir.** Minimum etkili değişiklik. Sağlıklı ekran sağlıklı denir ve bırakılır.

### Neyi değil

- Bir zevk polisi değil. "Bence güzel değil" bir bulgu değildir.
- Bir AI dedektörü değil. "Bunu AI yazdı mı?" sorusuna cevap vermez; isimlendirilmiş desen gösterir.
- Bir yeniden tasarım ajansı değil. Navigasyonu, marka kimliğini, iş mantığını sormadan değiştirmez.
- Bir performans profiler'ı değil. Profilleyemediğini "profilenmedi" diye işaretler.
- Bir test paketi değil. "Bozuk" şikayetini testlerin çözer.

---

## 4. Kanıt

### 4.1 Korpus

İki mağazadan, 21 kategoriden, 7.786 uygulamadan **5.008.684 yorum** okundu. ABD, Birleşik Krallık, Hindistan, Kanada ve Avustralya'nın ücretsiz listeleri; üçüncü taraf toplayıcılarla değil, mağaza feed'leri ve açık kaynak bir scraper ile. Son 24 ay. 20 İngilizce mağaza vitrini.

| | App Store | Google Play |
|---|---|---|
| Uygulama | 5.632 | 2.154 |
| Vitrin | 20 | 20 |
| Korpus yorumu | 1.993.979 | 3.014.705 |
| 3 yıldız ve altı | 946.629 | 1.126.165 |
| 4 yıldız | 151.891 | 240.002 |
| Uygulama başına medyan kapsanan gün | 715 | 722 |

Bunun 2.072.794'ü 3 yıldız ve altı. Bu evrenden mağaza başına 600 düşük puanlı yorum rastgele çekildi ve **tek tek, tanımlara karşı** etiketlendi; ayrıca mağaza başına 150 dört yıldız yorumu. Etiketleme bir model tarafından, beş paralel oturumda, kural kodunu görmeden yapıldı. Sonra tüm korpus bir kural sınıflandırıcısıyla etiketlendi ve kural hataları Rogan–Gladen düzeltmesiyle telafi edildi; güven aralıkları hem referans örneklemini hem uygulamaları yeniden örnekleyen bir bootstrap'tan geliyor.

### 4.2 İnsanlar neyden şikayet ediyor

Düşük puanlı yorumlarda tema payı (referans etiketler, 3 yıldız ve altı):

| Şikayet | App Store | Google Play |
|---|---|---|
| Bir şey çalışmıyor (hata) | 35% | 35% |
| Destek, iade, dolandırıcılık | 22% | 20% |
| Uygulamanın arkasındaki iş (teslimat, sürücü, oyun dengesi) | 18% | 21% |
| Fiyat, ödeme duvarı, abonelik | 20% | 18% |
| Giriş ve hesap | 11% | 11% |
| Görev ortasında reklam ve popup | 9% | 12% |
| Bulmak ve kullanmak zor | 9% | 7% |
| Yeniden tasarım bir şeyi taşıdı veya kaldırdı | 7% | 5% |
| Yavaş, takılıyor | 5% | 6% |
| Çöküyor | 5% | 4% |
| AI özelliği araya girdi | 2% | 1% |
| Kendi telefonunda bozuk yerleşim | 1% | 1% |

Tasarım ve ön uç geçişinin doğrudan çözebileceği pay: **App Store %26, Google Play %24**. Hata, gecikme ve çökme birlikte her iki mağazada **%41**. Yani en büyük sorun grubu, bir tasarım incelemesinin göremeyeceği gruptur. Bu yüzden rapor performansı asla "temiz" diye işaretlemez.

### 4.3 Dört yıldızlar

Uygulamayı çoğunlukla seven insanların %87'si (App Store) ve %61'i (Google Play) yine bir sorun söylüyor. Liste değişiyor: eksik özellik ilk sırada (%30 / %12), destek ve giriş sorunları neredeyse kayboluyor (%2 ve altı). Yani düşük puanlı yorumlar ürünün acil sorunlarını, dört yıldızlar ise büyüme isteğini gösteriyor. İkisi farklı işler; SLOPDROP birincisine bakar.

### 4.4 Mor gradyan efsanesi

5 milyon yorumda "purple gradient" **bir kez** geçti; o da bir kullanıcının Copilot'tan mavi-mor gradyanlarını geri getirmesini istediği 2 yıldızlı bir yorum. "Gradient" 163 kez geçti, çoğu gradyan isteyen insanlardan.

Bu, gradyanın sorun olmadığı anlamına gelmiyor. Şu anlama geliyor: **kullanıcılar bizim estetik takıntımızı paylaşmıyor.** Onlar butonu bulamadıklarında, bir şey çalışmadığında, görev ortasında popup geldiğinde şikayet ediyor. Slop estetiği yine bir sinyaldir (jenerikliğin görünen yüzü), ama sıralamada öne geçemez.

### 4.5 Yöntemin sınırları

- Düşük puanlı yorum yazanlar tüm kullanıcıların rastgele örneği değil.
- Google Play'de tarih filtresi yok; yoğun uygulamalarda en yeni yorumlar saatleri kapsıyor.
- Yalnızca üst listelerdeki uygulamalar var; ilk 100 dışı yok.
- Referans etiketleri bir modelin; ikinci bir bağımsız geçiş yok.
- Kural sınıflandırıcısı bazı temalarda zayıf (kappa 0,2–0,4): hata, iş modeli, eksik özellik. Düzeltmenin kararsız olduğu yerde düzeltilmiş sayı raporlanmadı.
- Kurallar bağlamı kaçırır: alaycılık, olumsuzlama, dolaylı şikayet.
- Yorum "yavaş" der; ölçmez.

SLOPDROP bu sınırları ürünün içine taşır: her rapor "neyi kontrol edemedim" bölümüyle biter.

### 4.6 Kanıtın ürüne etkisi

Bu veri, inceleme sırasını belirler:

1. Görev yolu (kullanıcı görevini bitirebiliyor mu?)
2. Doğru (etiketler, sayılar, durumlar doğru mu?)
3. Durumlar ve girdi (yükleme, boş, hata, çevrimdışı, klavye)
4. Platform uyumu (yerel navigasyon, jestler, güvenli alan)
5. Erişilebilirlik (hedef boyutu, kontrast, metin ölçeği, odak)
6. Özgüllük (bu ürüne mi ait, şablona mı?)

Estetik, altıncı sırada ve tek başına yeterli değil. Bu sıra, "mor gradyanı bul" diyen bir aracı "kullanıcının görevini kim engelliyor" diye soran bir araca çevirir.

## 5. Taksonomi

Slop tek bir kural listesi değil, katmanlı bir olgu. Her katmanın kendi belirtileri, kendi ölçüm yöntemi ve kendi düzeltme sırası var.

| Katman | Örnek belirti | Nasıl ölçülür |
|---|---|---|
| Kopya | "Unlock your potential", "Oops!" | Metin deseni + insan yargısı |
| Yerleşim | İç içe kartlar, her bölümde aynı grid | Kod + ekran |
| Renk | Mor gradyan, anlamsız vurgu rengi | Kod (hex/HSL) + ekran |
| Tipografi | Tek boyut, sabit px, başlıkta letter-spacing | Kod + ekran |
| İkon | Emoji ikon, her satırda tinted kare | Kod + ekran |
| Hareket | `transition-all`, sonsuz pulse, hover'da büyüme | Kod |
| Durum | Sadece mutlu yol, spinner, boş hata | Kod + çalışan ürün |
| Doğru | Uydurma istatistik, yanlış boş durum | Kod + veri |
| Erişilebilirlik | Odak halkası yok, 44pt altı hedef, zoom kapalı | Kod + tarayıcı |
| Platform uyumu | Telefonda web sitesi, Android'de iOS kontrolü | Kod + cihaz |
| Mekân | Kafaya kilitli HUD, 1° altı metin | Kod + başlık takma |
| Performans | Sanallaştırılmamış liste, ana iş parçacığında iş | Kod (ipucu) + profil |

### 5.1 Kopya slop'u

Arayüzün yarısı cümledir. Buton etiketi, hata mesajı, boş durum, başlık, bildirim: hepsi kopya. SLOPDROP metni iki iş için ele alır: **düzelt** (varsayılan) ve **sapta** (yeniden yazmadan, deseni adıyla göster).

**İki iş, tek kural:** AI yazıp yazmadığını tahmin etme. Deseni isimlendir, satırı alıntıla, düzeltmeyi üç kelimeyle söyle. Dedektörler tahmin eder; isimlendirilmiş desen kullanıcının kontrol edebileceği kanıttır.

#### Düzeltmenin on dokuz ilkesi

1. **Yazarın sesini koru.** Taslağın kelime dağarcığını, ritmini, sertliğini, mizahını, tereddüdünü, sapmalarını ve cila seviyesini önce fark et. Kişisel olanı koru. Her paragrafı aynı düzgünlüğe getirme.
2. **Minimum etkili düzeltme yap.** Slop desenlerini, hataları, tekrarları ve belirsiz yerleri düzelt. Güçlü insan cümlelerine dokunma. Kaba ama sesli bir taslak, düzeltmeden sonra aynı kişi gibi okunmalı.
3. **Hazırlık bir şey katmıyorsa noktayı başa al.** Genel ısınma cümlelerini kes. Kişisel bir anekdot, itiraf veya parantez bağlam, gerilim ya da karakter yaratıyorsa kalsın.
4. **Sadece netlik kazandırıyorsa öne al.** Sonucu erken koymak okuyucuya yardım ediyorsa koy. Her bölümü aynı "nokta–detay–geçmiş" kalıbına sokma.
5. **Anlamı koru.** İddia, örnek, istatistik veya görüş uydurma. Belirsizse sor.
6. **Aç, aptallaştırma.** Özü, nüansı ve hassasiyeti koru. Sadece okumayı zorlaştıranı at: jargon, uzun cümle, soyut isim, düğümlü yapı.
7. **Etken çatı kullan.** "Ekip salı günü yayınladı", "karar ortaya çıktı"dan iyidir. Cansız şeylere insan fiilleri yaptırma.
8. **Her cümle yerini kazansın.** Boş niteleyicileri ve ısınma cümlelerini kes. "Bence", "belki", "dürüst olmak gerekirse" gerçek bir tereddüt, öz farkındalık veya konuşma ritmi taşıyorsa kalsın.
9. **Ritmi düzleştirmeden cümleyi çöz.** Gerçekten zor takip edilen cümleleri böl. Uzun konuşma cümleleri, fragmanlar ve tempo değişimleri net ve karakteristikse kalsın.
10. **Somut ve spesifik ol.** Soyutluk, yazının öldüğü yerdir. "Entegrasyon verimliliği artırdı" → "Entegrasyon deploy süresini 40 dakikadan 4 dakikaya indirdi". İsim, sayı, tarih, mekanizma, örnek.
11. **Taşınabilirlik testini uygula.** Bir cümle başka bir kişiye, şirkete, ülkeye veya ürüne değişmeden taşınabiliyorsa büyük ihtimalle dolgudur. Kes veya bu konuya özgü bir gerçek, örnek, mekanizma, sonuç ya da yargıyla değiştir.
12. **Anlat, söyleme.** Vurguyu gerçekler, eylemler, örnekler ve sonuçlar taşısın. Bir noktayı "önemli", "şaşırtıcı", "ince" diye etiketleyen yorumu kes. Çevre metin zaten gösteriyorsa okuyucuya güven ve yorumu sil.
13. **Spesifik gerçeği koru.** Yararlı bir detayı genel öneme dönüştürme. "Araç mühendislik verimliliğini önemli ölçüde artırır" → "Araç inceleme süresini 30 dakikadan 8 dakikaya indirdi".
14. **Fiiller işi yapsın.** Zayıf fiil öbeklerini doğrudan fiille değiştir. "Karar verdi" → "karar verdi"; "yapabilme yeteneğine sahip" → "yapabilir".
15. **İşi bil.** Yapıdan veya kelime seçiminden önce parçanın ne yapmaya çalıştığını ve kime hitap ettiğini bil.
16. **Yararlı keskinliği ve karakteri koru.** Güçlü görüşler, sert dil, mizah, küfür, kendini kesme ve dürüst itiraflar yazara aitse kalsın. Onları daha güvenli veya daha profesyonel bir dille değiştirme.
17. **Yapıyı, zarar vermiyorsa koru.** Yazarın ilerleyişini ve sapmalarını koru. Yeniden düzenlersen nedenini "Ne değişti" bölümünde söyle.
18. **Uydurma.** Kaynak yoksa istatistik, alıntı, logo, referans yok. Kaynak sor.
19. **Biçim içeriği takip etsin.** İçerik iki cümlelikse başlık açma; iki cümle daha iyi okunuyorsa liste yapma.

#### Kesilecek kelimeler

**Doğrudan yasak:** delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, this is huge, this changes everything, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.

**Çoğu zaman boş zarflar:** just, literally, honestly, simply, actually, truly, fundamentally, importantly, crucially, inherently, inevitably. Vurgu, tereddüt, karşıtlık veya doğal konuşma ritmi taşıyorsa kalsın.

**Çoğu zaman boş öbekler:** it's worth noting, it's important to note, at the end of the day, when it comes to, at its core, in today's world, in the age of, in the world of, the reality is, the truth is, in terms of, with regard to, in order to, going forward, in this article, let's dive in.

**Arayüz kopyası için ek liste:** "Unlock your potential", "seamless", "effortless", "supercharge", "all in one place", "next-level", "elevate your", "game-changer", "revolutionize", "unleash", "Welcome back!", "Oops! Something went wrong", "Submit", "Click here", "Tap here", "Let's get started", "You're all set", "Something magical".

#### On dokuz desen

Her desen: ne olduğu, neden slop olduğu, önce → sonra.

1. **İkili karşıtlık.** "This is not X. It's Y." / "The question isn't X, it's Y." / "It's not just X but Y." Y'yi doğrudan söyle. *"The question isn't the model. It's the eval."* → *"The eval matters more than the model."*
2. **Olumsuz listeleme.** "Not a X. Not a Y. A Z." Sadece Z'yi söyle.
3. **Isınma cümlesi.** "Here's the thing", "Let me be clear", "I'll be honest", "The uncomfortable truth is". Kes ve noktayı söyle.
4. **Sahte içgörü kurulumu.** "What nobody tells you", "The part everyone misses", "What most people get wrong". Yazarı tek uzman gibi gösterir. Kurulumu kes, iddiayı kendi başına bırak. *"The part everyone misses: distribution is the real moat"* → *"Distribution is the moat."*
5. **İki nokta üstüste açıklaması.** Bir isim öbeği, iki nokta, küçük harfle dramatik açıklama: *"The best part: it learns."* Düz cümle yaz: *"A separate agent grades it, which is what makes it work."* İki noktayı listeler, etiketler ve alıntılar için kullan.
6. **Dramatik fragman.** "That's it. That's the whole thing." / "X. And Y. And Z." Tam cümle kullan.
7. **Robotik ritim.** Tekrar eden cümle şekilleri, aynı paragraf yapıları, üst üste punchline fragmanları. Şekli sadece noktaya hizmet ediyorsa değiştir.
8. **Retorik kurulum.** "What if I told you...", "Think about it:", "Plot twist:", kendi cevapladığı sorular. Kes ve noktayı söyle.
9. **Yüzeysel analiz.** Anlamı açıkladığını sanan `-ing` kuyrukları: "highlighting", "underscoring", "reflecting", "showcasing". *"The launch adds file search, highlighting the team's commitment"* → *"The launch adds file search, so users can find old drafts without leaving the editor."*
10. **Önem şişirmesi.** "stands as a testament", "marks a pivotal moment", "plays a vital role", "solidifies its position". Gerçeği söyle, önemine okuyucu karar versin.
11. **Yorumcu üst-dil.** "That last part matters more than it sounds", "The key point is", "As you can see", "This distinction matters", gereksiz "In other words". Nokta netse sil; değilse destekle değiştir.
12. **Kaçamak atıf.** "Experts agree", "industry reports suggest", "many argue", "studies show". Kaynağı adlandır veya iddiayı kes. Kaynak yoksa uydurma, sor.
13. **Sahte güçlü fiil.** Netken "is" ve "has" kullan. *"The app serves as a centralized hub for sponsor management"* → *"The app tracks sponsors, drafts, due dates, and approvals in one place."*
14. **Eş anlamlı döngüsü.** Doğru kelime buysa tekrar et. *"The agent reviews the draft. The assistant scores the piece. The tool suggests fixes"* → *"The agent reviews the draft, scores it, and suggests fixes."*
15. **Sahte derin kapanış.** Noktayı sevimli bir metafora, aforizmaya veya mic-drop cümlesine çeviren son satırı sil. Daha iyi bir metafora çevirme, ritmini koruma. En net somut cümleyle bitir; kapanış gerekiyorsa düz bir çıkarım veya sonraki adım ekle.
16. **Özet kapanış.** "In conclusion", "Ultimately", "Overall" veya parçayı tekrar eden son paragraf. Okuyucu az önce oradaydı. Son somut nokta, çıkarım veya eylemle bit.
17. **Biçim slop'u.** Başlıklarda emoji, cümle ortasında kalın vurgu, iki cümlelik bölüme başlık, düz yazı olması gereken yerde madde listesi. Biçim içeriği süslemez, takip eder.
18. **Em dash bağımlılığı.** Varsayılan ritim aracı olarak kullanma. Kısa metinde hiç; uzun metinde virgül, nokta veya parantezden net biçimde iyiyse 1–2 tane. Kümeleri ve dekoratif olanları kaldır.
19. **Arayüz kopyası slop'u.** Başlığı tekrar eden alt başlık, kişilik yerine ünlem, ne olduğunu söylemeyen buton, nedeni ve sonraki adımı olmayan hata. Her hata bir neden ve bir eylem taşır.

#### Saptama çıktısı

Düzeltme isteğinde: tam düzeltilmiş metin + kısa **Ne değişti** bölümü. Saptama isteğinde: bulunan her desen, alıntılanan satır, üç kelimelik düzeltme. Puan yok, yeniden yazma yok, "AI yazdı" iddiası yok.

### 5.2 Arayüz ve deneyim belirtileri

Sekiz bölüm, kullanıcıların şikayet sıklığına göre sıralı. Her belirtinin yanındaki kimlik, dedektörün görebildiği durumda kural kimliğidir. Kimliksiz olanlar çalışan ürüne bakmayı veya ürün yargısını gerektirir.

**1. Kullanıcı sürtünmesi**
- Sık kullanılan kontroller taşınmış, kaldırılmış veya ayarlara gömülmüş
- Tanıdık bir jeste yeni bir anlam verilmiş
- Temel görevler fazladan adım istiyor veya birkaç ekran derinde
- AI özelliği temel görevi kesiyor ya da ekranın en iyi yerini kapatılamaz biçimde alıyor (`ui.sparkle-icon`)
- Reklam, promosyon, puanlama isteği ve popup görevi bölüyor
- Yükseltme veya yıkıcı ikon, sık kullanılan dokunma hedefinin yanında
- Sık eylemler başparmak erişiminin dışında
- Doğru görünen ama hiçbir şey yapmayan, geç tepki veren veya yanlış öğeyi tetikleyen kontroller
- Küçük ekranlarda kritik eylemler kırpılmış, üst üste binmiş veya erişilemez
- Okundu/seçili/aktif durumları ayırt edilemiyor, özellikle karanlık modda
- Yerleşim ekranın çoğunu dolguya ve chrome'a kaybediyor

**2. Doğrusuzluk**
- Başarısız yükleme boş durum olarak gösteriliyor ("Henüz sipariş yok" ama istek hata verdi)
- Toplamlar tek sayfa sonucundan hesaplanıyor
- "Son" listeler son değil, "canlı" veri önbellekten
- Buton etiketinin söylediği yerden başka yere gidiyor
- Uydurma veya yer tutucu sayılarla stat kutuları (`truth.invented-stat`)
- Kimsenin sağlamadığı sosyal kanıt ve hız iddiası: "Trusted by 10,000+ teams", "10x faster", logo duvarları, referanslar (`truth.unverified-claim`)
- Kodun çeliştiği güven veya gizlilik iddiası ("no tracking" ama reklam SDK'sı)
- Yanlış veya yaklaşık logolar

**3. Telefonda web sitesi (yerel uygulamalar)**
- Birkaç üst hedef için sekme yerine hamburger menü (`ux.drawer-nav`)
- Uygulama içinde pazarlama hero'su, özellik grid'i veya footer
- Breadcrumb, geniş tablo veya hover'a bağlı kontroller (`ux.hover-only`)
- Elle yapılmış geri butonları veya yerel jesti kaybeden navigasyon çubukları (`ux.back-gesture`)
- Sheet veya push ekrana ait görevler için ortalanmış modal
- Ana eylem yolu olarak küçük metin linkleri
- Tek ekranda, alan sırası ve girdi tipi düşünülmemiş uzun formlar

**4. Etkileşim ve durumlar**
- Dokunulabilir şeylerde basılı durum yok
- Sadece mutlu yol: yükleme, boş, hata, çevrimdışı eksik
- Şekli bilinen içerik için bile spinner
- Klavye odaklı input'u kapatıyor (`ux.keyboard-cover`), yanlış klavye tipi, klavyede gönder yok, kapatmak zor
- İçerik çentik, home indicator veya sistem çubuklarının altında (`ux.safe-area-off`)
- Geri kaydırma veya öngörülü geri bozuk (`ux.back-gesture`)
- Tazelik önemliyken pull-to-refresh yok veya liste sanallaştırılmamış (`perf.unvirtualized-list`)
- Her öğe açılışta soluklaşıp kayıyor, animasyon girdiyi bloke ediyor
- Alışkanlık hareketi: her özellikte transition (`motion.transition-all`), hover'da büyüyen kart (`motion.hover-scale`), sonsuz nabız atan nokta (`motion.decorative-pulse`)
- Her şeyde haptik veya hak eden anda hiç haptik yok
- Metin büyütüldüğünde kırpılan sabit yükseklik ve sabit punto (`a11y.fixed-text-size`)

**5. Jenerik görünüm: eski varsayılan**
- Hero, buton veya arka planda mor, indigo veya mavi-pembe gradyan (`ui.slop-gradient`)
- Şablonun rengi tema olarak kalmış: Flutter `Colors.deepPurple`, Android Studio `Purple40` (`ui.template-theme`)
- Gradyan metin (`ui.gradient-text`), parlama gölgesi (`ui.glow-shadow`), dekoratif blob, her yerde cam (`ui.glass-everywhere`)
- Sparkle ikonu (`ui.sparkle-icon`), ikon yerine emoji (`ui.emoji-icon`)
- Kart içinde kart (`ui.nested-cards`)
- Durum olmayan şeylerde pill badge
- "Unlock your potential" kopyası

**6. Jenerik görünüm: yeni varsayılan**
- Her şey beyaz veya kırık beyaz; her grup 1px gri kenarlıklı, yumuşak gölgeli, tek yarıçaplı kart
- Tek mavi veya siyah vurgu; paletin geri kalanı anlam taşımıyor
- Her satırın başında tinted yuvarlak kare içinde ikon (`ui.icon-tile`)
- Etiketlerin yanında, kullanıcının eyleme geçmediği küçük renkli nokta (`ui.status-dot`)
- "Overview", "Quick actions", "Recent activity" gibi küçük gri caps veya letter-spacing'li bölüm başlıkları (`ui.tracked-caps-label`)
- Sakinlik diye sunulan büyük boş marjlar; kullanıcının geldiği içerik chrome'dan az yer alıyor
- Her başlığın altında, başlığı başka kelimelerle tekrar eden gri metin
- Her ana ekranın üstünde üç sayılık stat satırı
- Tek font boyutu ve ağırlığı her işi yapıyor veya marka nedeni olmadan web fontu iyi sistem tipografisinin yerine geçmiş
- Her yerde aynı boşluk; hiçbir şey gruplanmamış
- Sola hizalı listenin daha hızlı okunacağı yerde ortalanmış metin
- Tinted arka plan üstünde düşük kontrastlı gri metin
- Hiçbir şey katmayan dolgu başlık, açıklama ve callout
- Aynı işi yapan kopya butonlar

**Bu bölümün testi:** Logoyu ve uygulama adını kapat. Bu ekran bir bankacılık, bir fitness ve bir yapılacaklar uygulamasına eşit derecede ait olabilir mi? Olabiliyorsa, ne kadar temiz görünürse görünsün, varsayılandır.

**7. Kopya**
- "Unlock your potential", "seamless", "effortless", "supercharge", "all in one place" (`copy.buzzword`)
- Ekranın en iyi yerini kaplayan "Welcome back!" (`copy.welcome-back`)
- Nedeni ve sonraki adımı olmayan "Oops! Something went wrong" (`copy.oops-error`)
- Başlığı tekrar eden alt başlık
- Kişilik yerine ünlem işareti
- Ne olacağını söylemeyen belirsiz buton (`copy.vague-button`)

**8. Performans**
- Her satırı baştan render eden listeler (`perf.unvirtualized-list`)
- Açılışta, ana iş parçacığında veya kaydırma/yazma yolunda ağır iş
- Küçük resim için tam boy görsel çözme
- Kaydırma, yazma veya sekme değiştirmede gecikme: gerçek cihazda profilleme ister

### 5.3 Web'e özgü belirtiler

Web'de her şey geçerli, artı şunlar. Önce sayfanın türüne karar ver: **uygulama** (insanların çalıştığı yer) veya **site** (insanları bir eyleme ikna eden yer). İkisi farklı başarısız olur.

**Web tabanı (kırılınca kritik):**
- Eylemler `<button>`, navigasyon `<a href>`; `div` + click handler klavye ve ekran okuyucu için görünmez (`web.clickable-div`)
- Her etkileşimli öğede görünür `:focus-visible`; `outline: none` ve yerine hiçbir şey (`a11y.focus-removed`)
- Zoom açık; `maximum-scale=1`, `user-scalable=no` yok (`a11y.zoom-disabled`)
- Her içerik görselinde alt metin, dekoratif olanda `alt=""` (`a11y.img-no-alt`)
- URL anlamlı: geri butonu önceki görünüme döner; filtre, sekme, arama, sayfalama URL'de
- Kontrast 4,5:1 gövde, 3:1 büyük metin ve anlamlı ikon
- Her animasyonda `prefers-reduced-motion` karşılığı
- 375px'te yatay kaydırma yok; 1920'de içerik genişliği sınırlı ve ortalanmış
- Formlarda etiket (placeholder etiket değil), doğru `type` ve `autocomplete`, hata alanın yanında ve kelimelerle, girilen veri korunuyor
- Hiçbir şey uydurulmamış (`truth.unverified-claim`, `truth.invented-stat`)

**Uygulama ekranları:** karşılama ve üç stat kartıyla açılan dashboard; her bölümde kenarlıklı kart, tek yarıçap; sparkline'lı, "vs" olmadan renkli delta'lı stat kartları; tek seride gökkuşağı grafik; her menü öğesinin yanında tinted kare ikon; masaüstünde kart olan tablolar; `transition-all`, hover'da büyüyen kart, sonsuz nabız atan skeleton; sayfa olması gereken şey için modal, eylem gerektiren hata için toast.

**Siteler:** ortalanmış hero (caps eyebrow pill, gradyan başlık, onu tekrar eden alt başlık, iki buton, arkada bulanık blob); ürünü göstermeyen veya elle çizilmiş sahte tarayıcı gösteren hero; her bölümde tekrarlanan üç özellik kartı; logo duvarı, stok avatarlı referans grid'i, "Trusted by 10,000+ teams"; her planda aynı checklist'e sahip, parlayan "Most popular" kartlı fiyat tablosu; her sayfanın sonunda e-posta kayıt bandı; scroll-jacking, parallax, her bölümün kaydırmayla belirmesi; 1280'de iki satırdan uzun başlık; hero başlığı, cümlesi ve ana eyleminin 1280×800'de birlikte görünmemesi.

**Web'in yeni varsayılanı:** her yerde Inter veya Geist, zinc/slate nötrler, `rounded-lg border shadow-sm` kartlar, her başlığın altında `text-muted-foreground`, her satırda `Badge`, iki sütunlu bento grid, griye çevrilmiş karanlık mod. shadcn/ui gibi kitler yapı taşı olarak sorunsuz; her yüzeyde dokunulmamış varsayılan olmaları belirtidir. Sayfada bu ürüne özgü ne var? Cevap sadece kopyaysa, varsayılandır.

### 5.4 Mekânsal belirtiler (VR/XR)

Mekânsal arayüz, iki boyutlu alışkanlıkların üç boyuta taşınmasıyla en hızlı slop üreten alan. Ayrıntılı referans [docs/spatial.md](docs/spatial.md); burada özet:

- Kafaya kilitlenmiş HUD ve menüler (`xr.headlocked-hud`)
- 1° görsel açının altında metin, 2°'nin altında hedef (`xr.small-gaze-target`)
- Her yerde parlayan cam panel, bloom, gradyan çevre (`xr.glass-everywhere`, `xr.bloom-glow`)
- Rastgele derinliklerde yüzen paneller, tutarsız ölçek (`xr.depth-mismatch`)
- Varsayılan smooth locomotion, snap turn yok, comfort vignette yok (`xr.forced-locomotion`)
- Sadece raycast; doğrudan dokunma, controller paritesi, el takibi yedeği yok (`xr.raycast-only`)
- Oturma modu, boy kalibrasyonu, yeniden ortalama yok (`xr.no-recenter`)
- Passthrough üstünde beyaz metin, düşük kontrast (`xr.passthrough-contrast`)
- İki boyutlu web sayfasının boşlukta yüzmesi (`xr.flat-web-panel`)
- Altyazı, caption, işaret dili alternatifi yok (`xr.no-captions`)
- UI geri bildirimi için ses ve haptik yok (`xr.no-feedback`)
- 72/90/120 Hz bütçesini aşan çizim, kare başına ayırma, geç latching yok (`perf.frame-budget`)

Mekânsal slop'un özel tehlikesi: iki boyutlu ekranda "temiz" görünen bir tasarım, başlıkta mide bulantısına, göz yorgunluğuna veya erişilemez kontrole dönüşür. Bu yüzden mekânsal inceleme, statik ekran görüntüsüyle asla "geçti" diyemez.

### 5.5 Kural kataloğu

Katalog `packages/rules/` altında veri olarak yaşar; aşağıdaki tablo onun okunabilir özetidir. Kimlikler kararlıdır ve append-only'dir. Önem: **C** kritik, **N** fark edilir, **M** küçük.

| Kimlik | Aile | Önem | Ne | Düzeltme |
|---|---|---|---|---|
| `ui.slop-gradient` | görünüm | N | Mor/indigo/pembe gradyan | Temadan düz yüzey; sadece markadan geliyorsa kalsın |
| `ui.gradient-text` | görünüm | N | Gradyan dolgulu metin | Ağırlık veya boyutla vurgula |
| `ui.template-theme` | görünüm | N | Şablonun varsayılan rengi tema | Marka vurgusu + semantik roller |
| `ui.glow-shadow` | görünüm | M | Renkli parlama gölgesi | Platform yüksekliği veya nötr gölge |
| `ui.status-dot` | görünüm | M | Kullanıcının eyleme geçmediği renkli nokta | Metin veya şekil yedeği yoksa sil |
| `ui.nested-cards` | görünüm | N | Kart içinde kart | Tek kapsayıcı; boşluk, ayırıcı veya liste |
| `ui.glass-everywhere` | görünüm | M | Aynı dosyada üçten fazla cam/blur yüzey | Camı çubuk ve sheet arkasına hapset |
| `ui.sparkle-icon` | görünüm | M | Sparkle ikonu | Eylemi adlandıran ikon veya metin |
| `ui.emoji-icon` | görünüm | M | Arayüz metninde emoji ikon | Platform ikon seti + erişilebilirlik etiketi |
| `ui.icon-tile` | görünüm | M | Her satırda tinted kare içinde ikon | İkonu metin renginde satır içi ver |
| `ui.tracked-caps-label` | görünüm | M | Letter-spacing'li küçük caps etiket | Cümle düzeni, gövde fontu, aralıksız |
| `perf.unvirtualized-list` | performans | N | Düz scroll içinde `.map` ile liste | FlatList/FlashList, List/LazyVStack, LazyColumn, ListView.builder |
| `a11y.fixed-text-size` | erişilebilirlik | N | Kullanıcı metin boyutunu yok sayan sabit punto | Platform metin stili veya ölçeklenen boyut |
| `ux.back-gesture` | platform | N | Sistem geri jesti kapalı/bozuk | Kenar kaydırma ve öngörülü geri; sadece veri kaybını koru |
| `ux.drawer-nav` | platform | N | Hamburger menü / drawer | 3–5 eş hedef için sekme; geniş ekranda rail |
| `ux.hover-only` | platform | M | Dokunmatik uygulamada hover davranışı | Bilgiyi hover'sız göster veya `@media (hover: hover)` |
| `ux.keyboard-cover` | etkileşim | M | Klavye input'u kapatıyor | KeyboardAvoidingView / imePadding / otomatik inset |
| `ux.safe-area-off` | platform | M | Güvenli alan yok sayılmış | Sadece arka planlar için yok say |
| `motion.transition-all` | hareket | M | Her özellikte transition | Özellikleri adlandır; genişlik/yükseklik animasyonu yok |
| `motion.hover-scale` | hareket | M | Hover'da büyüyen kart | Hızlı renk/yüzey değişimi; scale sadece basılıda |
| `motion.decorative-pulse` | hareket | M | Yükleme olmayan sonsuz nabız | Sadece canlı veya yüklenen şeyi animasyonla |
| `truth.unverified-claim` | doğru | N | Sayfanın desteklemediği sosyal kanıt/hız iddiası | Gerçek, kaynaklı sayı veya kaldır |
| `truth.invented-stat` | doğru | M | Arayüzde sabit kodlanmış istatistik | Gerçek veriden hesapla veya yer tutucu işaretle |
| `web.clickable-div` | erişilebilirlik | N | `div`/`span` üstünde click | `<button>` veya `<a href>` |
| `a11y.focus-removed` | erişilebilirlik | N | Odak halkası kaldırılmış | 2px `:focus-visible` halkası |
| `a11y.img-no-alt` | erişilebilirlik | N | Alt metinsiz görsel | Açıklama veya `alt=""` |
| `a11y.zoom-disabled` | erişilebilirlik | N | Pinch zoom kapalı | Viewport'tan kaldır; inputları 16px yap |
| `copy.oops-error` | kopya | N | Nedensiz "Oops"/"Something went wrong" | Neyin başarısız olduğunu ve ne yapılacağını söyle |
| `copy.buzzword` | kopya | M | Arayüzde pazarlama dolgusu | Düz kelimelerle ne yaptığını söyle |
| `copy.welcome-back` | kopya | M | En iyi yeri kaplayan karşılama | Yeri kullanıcının geldiği işe ver |
| `copy.vague-button` | kopya | M | Ne olacağını söylemeyen buton | Fiil + nesne: "Adresi kaydet" |
| `copy.binary-contrast` | kopya | M | "X değil, Y" kalıbı | Y'yi doğrudan söyle |
| `copy.faux-insight` | kopya | M | "Kimsenin söylemediği" kurulumu | Kurulumu kes, iddiayı bırak |
| `copy.colon-reveal` | kopya | M | İki nokta + dramatik açıklama | Düz cümle |
| `copy.importance-puffery` | kopya | M | "Bir dönüm noktası" şişirmesi | Gerçeği söyle |
| `copy.weasel-attribution` | kopya | N | "Uzmanlar diyor ki" | Kaynağı adlandır veya kes |
| `copy.metadiscourse` | kopya | M | "Bu kısım önemli" yorumu | Sil, kanıtla |
| `copy.fake-profound` | kopya | M | Sahte derin kapanış | Sil, somut cümleyle bitir |
| `copy.summary-recap` | kopya | M | "Sonuç olarak" özeti | Son somut noktayla bitir |
| `copy.formatting-slop` | kopya | M | Emoji başlık, dekoratif kalın, gereksiz liste | Biçimi içeriğe uydur |
| `xr.headlocked-hud` | mekân | C | Kafaya kilitli HUD/menü | Gövde veya dünya kilidi; yeniden ortalama |
| `xr.small-gaze-target` | mekân | C | 2° altı hedef, 1° altı metin | Hedefi ve tipografiyi büyüt; mesafeyi ayarla |
| `xr.glass-everywhere` | mekân | N | Her yüzeyde cam/bloom | Opak içerik yüzeyi; camı chrome'a sakla |
| `xr.depth-mismatch` | mekân | N | Tutarsız panel derinliği ve ölçek | Tek derinlik düzlemi, metre tabanlı ölçek |
| `xr.forced-locomotion` | mekân | C | Zorunlu smooth locomotion | Teleport + snap turn varsayılanı |
| `xr.no-comfort` | mekân | C | Vignette, hız sınırı, oturma modu yok | Comfort katmanı ve oturma seçeneği |
| `xr.raycast-only` | mekân | N | Sadece ışın; doğrudan dokunma yok | Doğrudan dokunma + controller paritesi |
| `xr.no-recenter` | mekân | N | Yeniden ortalama/boy kalibrasyonu yok | Tek jestle recenter |
| `xr.passthrough-contrast` | mekân | C | Passthrough üstünde okunmayan metin | Opak panel veya kontrastlı metin |
| `xr.flat-web-panel` | mekân | N | Boşlukta yüzen 2B web sayfası | Mekânsal hiyerarşiye çevir |
| `xr.no-captions` | mekân | N | Altyazı/caption yok | Altyazı ve metin alternatifi |
| `xr.no-feedback` | mekân | M | Ses/haptik geri bildirim yok | Dokunma ve onay için geri bildirim |
| `xr.uncanny-avatar` | mekân | M | Oyuncak bebek avatar/eller | Soyut veya stilize temsil |
| `web.scroll-jack` | web | N | Scroll-jacking, parallax | Doğal kaydırma |
| `web.chatbot-bubble` | web | N | Kapatılamaz AI balonu | Kapatılabilir, görev yolundan uzak |
| `web.autoplay-carousel` | web | M | Otomatik dönen carousel | Kullanıcı kontrollü |
| `web.dark-mode-invert` | web | M | Karanlık mod = gri inversiyon | Gerçek palet |
| `perf.frame-budget` | performans | C | Kare bütçesini aşan çizim | 72/90/120 Hz hedefi, geç latching |

## 6. Ölçüm

### 6.1 Önem dereceleri

- **Kritik:** kullanıcı görevi bitiremiyor, yanlış bilgi alıyor veya birincil kontrolü okuyamıyor/erişemiyor.
- **Fark edilir:** görev yavaşlıyor veya karışıyor, ya da ekran açıkça jenerik görünüyor.
- **Küçük:** görevi etkilemeyen cila.
- **Önce sor:** navigasyonu, görsel kimliği, gelir modelini veya sık kullanılan bir kontrolü değiştirecek düzeltme.

Küçük listesi kısa tutulur. Sekizden fazlaysa ilk sekizi yazılır, kalanı sayıyla verilir. Uzun cila kuyruğu, önemli bulguları gömer.

### 6.2 Altı boyut

Her boyut 0–4 arası puanlanır ve puanın bir gerekçesi olur: o boyuttaki en kötü bulgu ya da 4'ü hak eden şey.

| Boyut | Sorduğu soru | 0 | 4 |
|---|---|---|---|
| **Görev yolu** | İnsanlar geldikleri işi hızlı yapabiliyor mu, kontroller bekledikleri yerde mi, önlerinde ne var? | Temel görev bloke veya kesintili | Temel görev doğrudan, başparmak erişiminde, kesintisiz |
| **Doğru** | Etiketler, sayılar ve durumlar doğruyu mu söylüyor? | Hatalar boş olarak gösteriliyor, veri uydurulmuş | Her sayı ve durum gerçek ve etiketli |
| **Platform uyumu** | Navigasyon, jestler, kontroller ve güvenli alanlar platformun beklediği gibi mi? Web'de: gerçek buton/link, çalışan URL ve geri, odak, zoom, yerel form kontrolleri | Telefonda web sitesi veya web'i bozan sayfa | Her ekrana güvenen akıcı bir kullanıcı |
| **Durumlar ve girdi** | Yükleme, boş, hata, çevrimdışı, basılı, klavye | Sadece mutlu yol | Her durum tasarlanmış ve erişilebilir |
| **Erişim** | Hedefler, kontrast, metin ölçeği, ekran okuyucu etiketleri ve sırası | Ekran okuyucu veya büyük metinle kullanılamaz | Etiketli, sıralı, temiz ölçeklenen |
| **Özgüllük** | Bu ürüne mi benzüyor, eski veya yeni bir şablona mı? | Herhangi bir uygulama olabilir; baştan sona jenerik | Bu ürünün içeriği ve sesiyle inşa edilmiş |

Toplam **24** üzerinden:

| Puan | Bant | Anlamı |
|---|---|---|
| 21–24 | **Temiz** | Küçük cila. Sağlıklı ekran sağlıklı denir ve bırakılır. |
| 16–20 | **Lekeli** | Zayıf boyutlara odaklan. |
| 11–15 | **Slop** | Ciddi iş var. |
| 0–10 | **Derin slop** | Kritik ve görev yolundan başla. |

Türetilmiş **slop endeksi**: `round((24 − toplam) / 24 × 100)`. 0 temiz, 100 tamamen slop. Dashboard, rozet ve CI eşiği için tek sayı; klinik puan hâlâ 24'lük.

### 6.3 Ölçümün dürüstlüğü

- Performans puanlanmaz. Kendi satırı vardır.
- Sadece koddan inceleme yapıldıysa **Platform uyumu**, **Durumlar ve girdi** ve **Erişim** puanlarının önüne `~` konur (tahmini).
- Bir kontrol çalıştırılmadıysa "geçti" denmez.
- Simülatör ve debug build hız kanıtı değildir; sayıyı üreten ortam yazılır.
- Kural isabeti bulgu değildir; bağlamda doğrulanır.

### 6.4 Kural yoğunluğu ve CI kapısı

Tek başına bulgu sayısı kalite ölçüsü değil; büyük dosyada çok bulgu normal. İki ek metrik:

- **Yoğunluk:** 1.000 satır kod başına doğrulanmış bulgu.
- **Kritik sayısı:** sıfır olmadıkça birleştirme engellenir.

Önerilen kapı (`slopdrop.toml`):

```toml
[gate]
max_critical = 0
max_slop_index = 45
fail_on_new_rules = ["xr.*", "a11y.*"]
```

### 6.5 Rapor formatı

```text
SLOPDROP incelemesi
Hüküm: <tek kuru cümle, en kötü şeyi adlandırır>
Yığın: <framework ve platformlar>
İncelenen: <ekranlar, ana görevler, çalışan uygulamadan mı koddan mı>
Puan: <toplam>/24 <bant>  Görev <n> · Doğru <n> · Platform <n> · Durum <n> · Erişim <n> · Özgüllük <n>
Performans: <"Profilenmedi." + statik ipuçları, veya ölçüldüyse cihaz, build, araç, sayılar>

Kritik
- <dosya:satır> <ne yanlış, kimi nasıl etkiliyor> -> <spesifik düzeltme>

Fark edilir
- ...

Küçük
- ...

Önce sor
- <dosya:satır> <ne yanlış> -> <önerilen düzeltme ve kullanıcı için neyi değiştirir>

Muaf
- <kural veya belirti> <neden> ile kaldı, chart'a kaydedildi

Korumaya değer
- <zaten iyi çalışan ve tedaviden sağ çıkması gereken>

Kontrol edilmedi
- <doğrulanamayan her şey; profil yapılmadıysa performans her zaman>
```

Boş bölümler yazılmaz, "Kontrol edilmedi" hariç. Ekran sağlıklıysa hüküm bunu söyler ve rapor kısalır. Bölümleri doldurmak için sorun uydurmak, slop'un başka bir türüdür.

**Hüküm cümlesi:** tek cümle, kuru, bu uygulamaya özgü. En kötü şeyi adlandırır, en komik olanı değil. Kişiye karşı acımasız olmaz, AI kullanımı hakkında konuşmaz; hasta ekrandır.

İyi: *"Sipariş butonu taşınmış, liste takılıyor ve dashboard kimsenin ölçmediği sayılar raporluyor."*
Kötü: *"Klasik AI slop."* Genel, yani tedavi ettiğimiz şeyin ta kendisi.

---

## 7. Protokol

Protokol, ajanın ne zaman ne yapacağını belirler. Kod değil, sözleşmedir: `skills/slopdrop/SKILL.md` bunun çalışan hâli.

### 7.1 Komutlar

| Komut | Ne yapar | Nerede durur |
|---|---|---|
| `review [ekranlar]` | Tam teşhis, puanlarla. "İncele", "denetle", "kritik et" için varsayılan. | Raporda |
| `treat [ekranlar]` | Teşhis, yön anlaşması, düzeltme, doğrulama. "Düzelt", "temizle", "native yap", "yeniden tasarla" için varsayılan. | Doğrulanmış düzeltmelerde, önce/sonra ile |
| `scan [yol]` | Sadece dedektörü çalıştır, isabetleri rapora triyajla. Hızlı, kod-only. | Triyajlı listede |
| `chart` | `.slopdrop/chart.md` yaz veya tazele: projenin duran bağlamı. | Chart'ta |
| `follow-up [ekranlar]` | Son ziyaretin ekranlarını yeniden incele, puanları karşılaştır. | Karşılaştırmada |
| `audit-copy [metin]` | Sadece kopya: desenleri adlandır, alıntıla, düzelt. | Bulgularda veya düzeltilmiş metinde |
| `sync` | MCP üzerinden chart, bulgu ve ziyaretleri diğer ajanlarla hizala. | Senkron durumunda |

Komut yok ve niyet belirsizse tek satırda hangisi olduğunu sor. Niyet netse komutu seç ve seçtiğini söyle.

### 7.2 On iki adım

Her komut sadece ihtiyaç duyduğu adımları çalıştırır:

- `review` ve `follow-up`: 1–8, sonra 12. Düzenleme yok.
- `treat`: hepsi.
- `scan`: 1, 2, 7; isabetleri rapora triyajla ve dur. Ekran görüntüsü yok, puan yok, ziyaret kaydı yok.
- `chart`: 1 ve 2; sonra chart'ı yaz ve dur.

1. **Chart'ı oku.** `.slopdrop/chart.md` varsa oku: platformlar, yığın, ana görevler, marka kararları, kabul edilmiş istisnalar. Kabul ettiği hiçbir şeyi yeniden işaretleme. Yoksa koddan çıkarabildiğini çıkar ve sonunda `chart` öner; bloklamak için bekleme.
2. **Yığını ve platformları belirle.** Proje yapılandırmasını oku. Neye gönderdiğini not et, sonra eşleşen rehberi oku: yerel uygulamalar için iOS ve Android, çapraz platform için stacks, web için web, mekân için spatial. Web projesi iki türden biridir: insanların çalıştığı uygulama veya ikna eden site; ikisi farklı yargılanır.
3. **Kapsamı belirle.** Kullanıcının adlandırdığı ekranlar. Adlandırmadıysa ilk açılış yolu ve geri dönen kullanıcının gördüğü ana ekran; sitede ana sayfa ve ana eylemi taşıyan sayfa. Oradaki bir veya iki görevi adlandır. Ürünün tamamını istenmeden tarama.
4. **Mevcut tasarım kararlarını bul.** Tema, token'lar, paylaşılan bileşenler, stil rehberi. Gerçek markaya saygı duy: logo, marka rengi, yazı tipi, tasarım sistemi. Bir belirti gerçek markayla eşleşiyorsa marka kazanır; "önce sor" altına yaz. Logo'daki mor gradyan veya sparkle, kullanıcı marka olduğunu söylemedikçe belirtidir.
5. **Çalışan ürüne bak.** Mobil: simülatör, emülatör veya cihazda ekran görüntüsü; açık ve karanlık, en büyük metin boyutunda. Web: 375, 768, 1280 ve 1920 genişlikte, açık ve karanlık, %200 zoom'da. Çalıştıramıyorsan söyle, koddan incele ve tahmin ettiklerini işaretle. Commit edilmiş ekran görüntüleri eski olabilir.
6. **Önce kendi okumanı yap.** Her ana görevi üç kişi olarak yürü: ilk kez kullanan; acele eden, telefonunda tek başparmakla veya web'de sadece klavyeyle gezen; en büyük metinle ve ekran okuyucuyla kullanan. Dedektörü çalıştırmadan önce her birini neyin yavaşlattığını not et; kural listesi incelemenin yerine geçmesin.
7. **Dedektörü çalıştır.** `node <skill-dir>/scripts/detect.js <kaynak dizinleri> --json`. Kodu okur, ekranı değil; gözden kaçan desenleri yakalar. Platformu en yakın `package.json`'dan seçer; yanlışsa `--platform web|mobile` ver. Her isabeti bağlamda doğrula: isabet kanıttır, bulgu değildir. Node yoksa atla ve "kontrol edilmedi" altında söyle.
8. **Teşhis et.** Belirtileri ve performansı kontrol et, sonra puanla ve raporu yaz. Görevi bloke eden veya yavaşlatan her şeyi görsel olan her şeyin üstüne koy.
9. **Ne kadar değişeceğine karar ver, yönü anlaş.** Sadece `treat`. Vakayı ağır, hafif veya sağlıklı ilan et. Ağırda beş satırlık yönü yaz. Teşhisi ve yönü göster, ilk düzenlemeden önce kullanıcının cevabını bekle; kullanıcı zaten "devam et" demediyse.
10. **Kaynakta tedavi et.** Sadece `treat`. Önce token'lar ve paylaşılan bileşenler, sonra ekranlar; bulguların sırasıyla Kritik, Fark edilir, Küçük.
11. **Doğrula.** Değişen ekranları açık, karanlık, en büyük metin ve desteklenen her ekran boyutunda derle ve yeniden kontrol et. Değişen her kontrole dokun veya sekmeyle gez. Dedektörü değişen dosyalarda yeniden çalıştır. Sonra taze bir bakış al: alt ajan başlatabiliyorsan ona sadece "sonra" ekran görüntülerini ve ürünün tek cümlelik tanımını ver; ekranların başka bir ürüne ait olup olamayacağını ve neyin üretilmiş okunduğunu sor. Bütçe: bir toplu bakış, bir düzeltme turu, bir doğrulama bakışı. Kontrol edemediklerini açıkça söyle.
12. **Ziyareti kaydet.** Raporu `.slopdrop/visits/<YYYY-MM-DD-HHmm>-<kapsam>.md` altına yaz; chart kapatmadıysa. Yolu tek satırda söyle.

### 7.3 Triyaj: ne kadar değişecek

Teşhisi dürüstçe oku ve plan yapmadan önce vakayı ilan et.

- **Ağır.** Renk, tip, ikon, kopya ve yerleşimde üretilmiş belirtiler; ya da Görev yolu veya Doğru puanı 2 veya altı. Tam tedavi: yön, sonra her geçiş.
- **Hafif.** Çoğu tasarlanmış, birkaç belirti kalmış ekran. Sadece bulguları düzelt. Paleti, tipi, yerleşimi ve görselleri koru. Büyük fikirler raporda öneri olarak kalır, değişiklik olarak değil.
- **Sağlıklı.** Açıkça söyle. İki üç küçük iyileştirme öner, kesin değerlerle; sadece kullanıcı kabul ederse uygula. İyi bir ekranı farklı olsun diye asla değiştirme.

### 7.4 Yön: beş satır

Ağır vakada, hiçbir şeye dokunmadan önce beş kısa satır yaz. Ürünün ne yaptığından ve kime hizmet ettiğinden türet; modadan değil. Teşhisle birlikte göster ve cevabı bekle, çünkü yönü sonra değiştirmek her şeyi yeniden yapmak demek.

- **Ürün.** Ne yapıyor, kimin için; tek düz cümle.
- **Kullanım.** Nerede ve nasıl: trende tek elle, bütün gün masada, mutfakta ıslak elle, yılda bir vergi zamanı. Yoğunluğu, hedef boyutunu ve kontrastı bu belirler.
- **Karakter.** İki üç somut kelime: "kesin, sakin, biraz kuru" veya "hızlı, dost, gürültülü". Temiz, modern, şık, minimal, premium yasak: her şablonu tarif ederler.
- **Parlak nokta.** Ekranın renk ve özen aldığı bir iki yer; içerikten seçilir: dikkat isteyen bölge, soruyu cevaplayan grafik, yemeğin fotoğrafı. Geri kalan sessiz kalır.
- **İmza.** Sadece bu üründe olabilecek küçük bir detay, tutarlı kullanılır. Bir tane, beş değil.

Gerçek bir marka varsa yön onun etrafına kurulur. Hafif vakada yön mevcut markadır; yeni yön yazılmaz.

### 7.5 İş sırası

1. Token'lar: renk rolleri, tip ölçeği, boşluk ölçeği, yarıçap, yükseklik, hareket.
2. Paylaşılan bileşenler: butonlar, liste satırları, kartlar, başlıklar, boş ve hata durumları.
3. Ekranlar: Kritik, Fark edilir, Küçük sırasıyla.
4. "Önce sor" maddeleri, kullanıcı cevap verdikten sonra.

Görsel işte geçişler halinde ilerle ve her geçişi ekranın tamamında bitir. Sıra:

1. **Boşluk:** küçük bir ölçek; ilgili şeyler ilgisizlerden yakın; aynı tür satırlar aynı yükseklikte.
2. **Renk:** semantik roller, tek vurgu, renk sadece anlam taşıdığı yerde.
3. **İkon:** tek set, tek boyut, tek çizgi kalınlığı, metin rengi; emoji ve dekoratif ikon gider.
4. **Kopya:** ürünün kendi isim ve fiilleri; nedeni ve sonraki adımı olan hatalar; hype yok, uydurma iddia yok.
5. **Tip:** platform stilleri veya tek ölçek, iki ağırlık, cümle düzeni, sayılarda tabular figür.
6. **Yerleşim:** içerik önce, yerel yapı, ekran başına tek birincil eylem.
7. **Detaylar:** durumlar, iç içe geçen yarıçap, odak, basılı, boş, hata, çevrimdışı.
8. **Hareket:** değişimi açıklayan kalır, döngüye giren veya süsleyen gider.

### 7.6 Düzeltmenin kuralları

- **Eklemeden önce çıkar.** Çoğu ekran kapsayıcı, renk, başlık ve kopya kaybederek iyileşir.
- Sık kullanılan kontrol, jest ve URL'leri kullanıcının beklediği yerde tut. Taşımadan, kaldırmadan veya yeniden tanımlamadan önce sor.
- İş mantığını, veri akışını ve analitiği değiştirme.
- Navigasyon yapısını veya görsel kimliği değiştirmeden önce sor.
- Bağımlılık eklemeden önce sor. Platformun ve projenin zaten sahip olduğunu kullan.
- Metrik, alıntı, logo, referans uydurma. İddianın gerçek olup olmadığını sor; değilse kaldır ve raporda listele.
- Yer tutucu içeriği yer tutucu olarak işaretle, cilalama. Mock veri inandırıcı görünür, asla `123.456` veya `[X]` değil.
- Diff'i anlaşılan ekranlarda ve ihtiyaç duydukları paylaşılan kodda tut.
- Platformun yapı taşlarını özel olanlardan önce kullan.
- Sağlıklı ekranı farklı olsun diye değiştirme; sağlıklı olduğunu söyle.

### 7.7 Bir varsayılanı diğeriyle değiştirme

En sık başarısız tedavi, mor ve parıltılı bir ekranı alıp beyaz, gri kenarlıklı kartlar, tek mavi vurgu, her satırda tinted kare ikon ve bol boşlukla geri döndürür. Daha temizdir. Aynı zamanda her modelin varsayılan görünümüdür ve insanlar bir bakışta tanır.

Tedavi edilmiş ekran karakterini üründen alır, stilden değil:

- **İçerik önce.** Kullanıcının geldiği şey en çok yeri ve en güçlü tipografiyi alır. Chrome, karşılama ve bölüm etiketleri daha az alır. Sonra hâli öncesinden daha az gerçek içerik gösteriyorsa tekrar bak.
- **Ürünün kendi isimleri.** Başlıklar orada ne olduğunu söyler ("Mutfak ışıkları", "Bu hafta teslim"), dashboard kategorisini değil ("Genel bakış", "Hızlı eylemler").
- **İşi olan renk.** Marka rengini koru. Rengi duruma ve anlama ver (seçili, gecikmiş, çevrimdışı, yıkıcı), süslemeye değil. Marka rengi yoksa uydurmadan önce sor.
- **Sakin chrome, tek parlak nokta.** Navigasyon, butonlar ve etiketler sessiz; yöndeki parlak nokta rengi ve özeni taşır.
- **Hiyerarşi önce tip ve boşluktan.** Boyut, ağırlık ve gruplama; kapsayıcı, kenarlık ve tint'ten önce. Liste genellikle kart yığınından iyidir.
- **Yerel, özelden iyidir.** Sistem listesi, sheet'i, sekme çubuğu veya web'de gerçek buton, link, dialog ve select; markayla stillenmiş hâli elle yapılmış taklitten iyidir.
- **Kullanıma uygun yoğunluk.** Günde defalarca kullanılan araç yoğun olabilir. Cömert boşluk bir nedeni olan seçimdir, varsayılan değil.

### 7.8 Taban: pazarlık konusu olmayanlar

Değişen her ekran, "bitti" demeden önce bunları sağlar:

- Dokunma hedefi iOS'ta en az 44pt, Android'de 48dp; dolgu ve genişletilmiş isabet alanları dahil. Web'de en az 24×24 CSS piksel, birincil dokunma hedefleri için 44.
- Kontrast gövde metni için 4,5:1, büyük metin ve anlamlı ikonlar için 3:1; açık ve karanlıkta.
- Platform metin stilleri veya adlandırılmış ölçek. Metin kullanıcının boyut ayarını veya tarayıcı zoom'unu takip eder; en büyük boyutta veya %200'de hiçbir şey kırpılmaz.
- İçerik ve kontroller çentik, Dynamic Island, home indicator, durum çubuğu ve klavyeden uzak. Arka planlar kenardan kenara gidebilir.
- Ekran başına tek birincil eylem, telefonda başparmak erişiminde.
- Küçük bir ölçekten boşluk. İlgili öğeler ilgisizlerden yakın.
- Semantik renk rolleri: arka plan, yüzey, metin, ikincil metin, vurgu, yıkıcı. Karanlık mod gerçek bir palet, inversiyon değil.
- Yerel navigasyon: 3–5 eş hedef için sekmeler, derine inmek için push, kısa yan görevler için sheet; web'de gerçek linkler ve çalışan geri butonu.
- Sadece ikonlu kontroller ekran okuyucu için etiketli. Mantıklı odak sırası ve görünür odak stili. Reduce Motion'a saygı. Renk asla tek sinyal değil.
- Dokunulan her şey için basılı, işaretçi varsa hover, odak, devre dışı, yükleme, boş, hata ve çevrimdışı durumları.
- Birden fazla platforma gönderen ürünlerde her platformun kendi desenleri. Markayı paylaş, her kontrolü değil.

### 7.9 Muafiyet

Bir belirti gerçek bir nedenle kalabilir: marka, kullanıcı ihtiyacı, platform kısıtı. Nedenini `.slopdrop/chart.md` altında **Kabul edilen** bölümüne yaz ve raporda **Muaf** altında listele. Nedensiz kalan belirti muafiyet değil, bulgudur.

### 7.10 Teslimden önce öz kontrol

Her birini tedavi özetinde tek satırda cevapla:

1. **Logoyu kapat.** Sonra ekran ilgisiz bir ürüne ait olabilir mi? Evetse bitmedi.
2. **Komşu testi.** Aynı kategorideki bir rakip, aynı istekle bu ekranın aynısını alır mıydı? Evetse bir kararı değiştir ve hangisini söyle.
3. **Kapsayıcıları say.** Kart, kenarlık ve tintli arka plan sayısı azaldı mı?
4. **Renkleri say.** Ekrandaki her renk bir anlam taşıyor mu?
5. **Noktaları bul.** Her küçük renkli nokta, badge ve pill: hangi durumu gösteriyor, renk körü bir kullanıcı anlar mı?
6. **Görevi bul.** Ana görevin kontrolü aynı yerde mi, daha iyi mi; tek başparmakla veya tek Tab ile erişilebilir mi?
7. **Dedektörü çalıştır.** Değişen dosyalarda. Tutulan her isabeti açıkla.
8. **Taze bakış.** Taze bağlamlı gözlemci ne dedi, neyi değiştirdin? Başlatamadıysan söyle.
9. **Kontrol etmediklerini söyle**, performans dahil. Çalıştırılmayan kontrol geçmiş sayılmaz.

### 7.11 Ziyaret kaydı ve takip

Rapor `.slopdrop/visits/<YYYY-MM-DD-HHmm>-<kapsam>.md` dosyasına yazılır; yerel saat 24 saatlik biçimde, kapsam ekranların kısa slug'ı ("home", "checkout-flow"). Dosya varsa `.md` öncesine `-2`, `-3` eklenir; ziyaret asla üzerine yazılmaz. Dosya adları zamana göre sıralanır, böylece `follow-up` aynı kapsamın son dosyasını okur ve boyut başına bir satır ekler: `Görev yolu 2 -> 3`.

### 7.12 Chart: projenin duran bağlamı

`.slopdrop/chart.md` her komutun okuduğu bağlamdır. Bir sayfayı geçmez.

```markdown
# Chart

Yığın: <framework ve sürüm>
Platformlar: <iOS, Android, iPad, tablet, foldable, web, visionOS, Quest>
Ziyaretler: açık

## Ana görevler
1. <görev ve başladığı ekran>

## Kullanıcılar ve bağlam
<bir iki satır>

## Marka
- Renk: <hex ve nereden geldiği>
- Tip: <yüzler ve nerede kullanıldığı>
- Koru: <belirtiyi yenen marka kararları, ör. "gradyan uygulama ikonundan geliyor">

## Kabul edilen
- <belirti veya kural kimliği>: <neden kaldı, kim karar verdi, tarih>

## Dokunulmaz
- <ekran veya kontrol>: <neden>
```

Chart yazılırken koddan çıkarılabilen her şey çıkarılır; sadece kodun söyleyemediği, tek mesajda en fazla dört soru sorulur: insanlar bu uygulamayı ne yapmak için açıyor; kimler, nerede; görünümün hangi parçaları marka ve kalmalı; neler dokunulmaz.

## 8. Platform matrisi

Aynı slop her yüzeyde farklı görünür, aynı taban ise her yerde geçerlidir. "Mobil, web, VR, XR vb." derken kastettiğimiz matris bu:

| Yüzey | Başarısızlık biçimi | Taban | Ana test |
|---|---|---|---|
| **iOS / iPadOS** | iPhone uygulaması gibi davranmayan, web sitesi kokan uygulama | 44pt hedef, Dynamic Type, güvenli alan, kenar kaydırma, sekme çubuğu | Simülatörde küçük iPhone + iPad Split View, karanlık, en büyük metin |
| **Android** | Material kostümü giymiş iPhone uygulaması | 48dp hedef, `sp`, insets, öngörülü geri, navigasyon çubuğu/rail | Emülatörde küçük telefon + tablet/foldable, gece modu, font_scale 2.0 |
| **Web uygulaması** | Web'i bozan uygulama: div buton, odak yok, zoom kapalı | Gerçek buton/link, `:focus-visible`, URL, geri, %200 zoom | 375/768/1280/1920, karanlık, klavye turu |
| **Web sitesi** | Birbirinin kopyası hero ve özellik kartları | Teklif 5 saniyede anlaşılır, eylem görünür, kanıt gerçek | 1280×800'de başlık + cümle + eylem birlikte |
| **visionOS** | Kafaya kilitli cam paneller, 1° altı metin | Göz + pinch, hover feedback, opak içerik yüzeyi, recenter | Cihazda 30 dk oturum, en büyük metin, VoiceOver |
| **Meta Quest / PCVR** | Zorunlu smooth locomotion, düşük fps, okunmayan panel | 72/90/120 Hz bütçesi, teleport + snap turn, vignette, oturma modu | Cihazda 15 dk, performans overlay, el + controller |
| **WebXR** | Tarayıcıda masaüstü sayfası, güvenli olmayan hareket | Girdi çeşitliliği, kare bütçesi, konfor seçenekleri | Quest tarayıcı + masaüstü tarayıcı |
| **Masaüstü** | Web sayfasının pencerede taklidi, klavye yok sayılmış | Klavye kısayolları, yoğunluk, pencere boyutları, çoklu monitör | 1280×720'den 4K'ya, klavye-only |
| **TV** | Telefon arayüzünün büyütülmesi | 10-foot UI, odak halkası, D-pad, okunabilir uzaklık | 3 m mesafeden, kumanda ile |
| **Saat** | Telefon ekranının küçültülmesi | Tek bakışta anlaşılan tek eylem | Bilekte, güneş ışığında |
| **Ses** | Ekran varsayımı | Sözlü onay, geri alma, kesintiye dayanıklılık | Eller serbest, gürültülü ortam |

Kural: **markayı paylaş, her kontrolü paylaşma.** Çapraz platform uygulama her platforma kendi garantisini borçludur.

### 8.1 Yığın matrisi

Yerel yapı taşları, özel muadillerden önce gelir.

| Yığın | Navigasyon | Liste / tazeleme | Sheet | Cila |
|---|---|---|---|---|
| SwiftUI | `NavigationStack`, `TabView` | `List`, `.swipeActions`, `.refreshable` | `.sheet` + `.presentationDetents` | SF Symbols, `.font(.body)`, `ContentUnavailableView`, `.sensoryFeedback` |
| UIKit | `UINavigationController`, `UITabBarController` | `UICollectionView` list, `UIRefreshControl` | `UISheetPresentationController` | SF Symbols, `preferredFont(forTextStyle:)`, `UIContentUnavailableConfiguration` |
| Jetpack Compose | `Scaffold`, `TopAppBar`, `NavigationBar`, `NavigationSuiteScaffold` | `LazyColumn` + `key`, `PullToRefreshBox` | `ModalBottomSheet` | `MaterialTheme.typography`, `WindowInsets.safeDrawing`, `Modifier.imePadding()` |
| React Native / Expo | Native stack, native tabs | `FlatList` / FlashList, `RefreshControl` | Native modal (`presentation: 'formSheet'`) | `Pressable`, `react-native-safe-area-context`, `KeyboardAvoidingView`, `expo-haptics` |
| Flutter | `NavigationBar`, `CupertinoTabBar`, platform route | `ListView.builder`, `RefreshIndicator` | `showModalBottomSheet` | `Theme.of(context).textTheme`, `SafeArea`, `.adaptive`, `HapticFeedback` |
| Ionic / Capacitor | `ion-tabs`, `ion-nav`, `ion-header` | `ion-list`, `ion-refresher`, sanal kaydırma | `ion-modal` + breakpoints | `mode`, `env(safe-area-inset-*)`, `@capacitor/haptics` |
| NativeScript | `page-router-outlet`, `ActionBar`, `TabView` | `ListView` | `ModalDialogService` | `iosOverflowSafeArea`, platform metin stilleri |
| visionOS / SwiftUI | `WindowGroup`, `NavigationStack`, `TabView` | `List`, `LazyVStack` | `.sheet`, volume | `.glassBackgroundEffect`, hover effect, `.spatialTapGesture` |
| Unity / Quest | XR Interaction Toolkit, `NavMesh` | Object pool + `ScrollRect` yerine sanal liste | Spatial panel | URP, XR haptics, `OVRInput` |
| WebXR | DOM overlay veya 3B panel | Sanal liste, sabit panel boyutu | 3B dialog | `XRSession`, `requestAnimationFrame`, foveation |

**Yığına özgü belirtiler:**

- **React Native / Expo:** her yerde varsayılan fade'li `TouchableOpacity`; her hata, başarı ve onay için `Alert.alert`; kökte tek `SafeAreaView` yüzünden çift dolgu; native sekmeyi yeniden yazan JS tab bar; Expo starter artıkları (varsayılan tint, `ParallaxScrollView`, `HelloWave`, arkasında gerçek ölçek olmayan `ThemedText`).
- **Flutter:** iOS'ta `.adaptive` varken Material widget; `Colors.deepPurple` hâlâ seed; `WillPopScope` (deprecated, öngörülü geri bozuk), `PopScope` kullan; taşmayı gizlemek için sabit `TextScaler`.
- **Ionic / Capacitor:** iOS'ta `mode="md"`, Android'de `mode="ios"`; telefonda masaüstü CSS'i (hover, geniş max-width, çok kolonlu grid); `viewport-fit=cover` ve safe-area eksik.
- **Compose / SwiftUI:** uydurma veriyle dolu preview'ların gerçek boş durum olarak yayınlanması; her satırda `Card` veya yuvarlak arka plan.
- **Unity / Quest:** her panelde aynı cam materyal; gerçek zamanlı gölge ve bloom; kare başına `GetComponent`; `Canvas` yeniden çizimi; metin için doku atlası yerine her yazıya ayrı materyal.

---

## 9. Mekânsal tasarım

Mekânsal arayüz, tasarım kararlarının fiziksel sonucu olduğu tek yüzey. Yanlış karar sadece çirkin değil, mide bulandırıcı. Bu bölüm visionOS, Quest ve WebXR için ortak zemini tanımlar; platform HIG değeri her zaman önceliklidir.

### 9.1 Üç derinlik düzlemi

| Düzlem | Mesafe | Ne yaşar | Kural |
|---|---|---|---|
| **Yakın** | 0,35–0,6 m | Doğrudan dokunma, el menüsü, tutma | Sadece kol mesafesinde; hedef 2° üstü |
| **Orta** | 1–2 m | Paneller, listeler, formlar, medya | Varsayılan çalışma düzlemi; metin ≥ 1° |
| **Uzak** | 3–10 m | Bağlam, sahne, büyük görsel | Okunabilir metin yok; sadece manzara ve durum |

Paneller arasında rastgele derinlik farkı yaratma. Göz, her panel için yeniden odaklanır; bu hem yorar hem hiyerarşiyi bozar. Aynı işi yapan paneller aynı düzlemde olur.

### 9.2 Açısal ölçü, piksel değil

Mekânsalda piksel anlamsızdır; görsel açı anlamlıdır.

- **Metin:** dikey yükseklik en az **1°**. 1,5 m'de bu yaklaşık 2,6 cm; ~26–30 px eşdeğeri. Gövde metni için 1,2°'nin altına inme.
- **Göz hedefi:** en az **2°**; birincil eylemlerde 3°. 1,5 m'de 2° ≈ 5,2 cm.
- **Satır uzunluğu:** 60–80 karakter. Daha uzunu baş hareketi ister.
- **Kontrast:** opak panel üstünde en az 4,5:1. Passthrough üstünde doğrudan metin yazma; panel opaklığı en az %90 olsun veya metni opak bir yüzeye taşı.
- **İnce font yok.** Mekânsalda `light` ve `thin` ağırlıklar kenar yumuşamasıyla kaybolur; regular ve medium kullan.
- **Cap height, x-height'tan önemli.** Küçük caps etiketler mekânsalda okunmaz; cümle düzeni kullan.

### 9.3 Etkileşim modeli

- **Yakın mesafe:** doğrudan dokunma (pinch, poke). Hedef parmakla kapanmayacak kadar büyük.
- **Orta ve uzak:** ışın veya bakış + pinch. Işın ucunda görünür bir işaretçi, hedef üstünde hover vurgusu, pinch'te ses ve haptik.
- **Bakış tek başına seçim değildir.** Bakış + onay (pinch, tap, dwell) kullan. Dwell varsa süresi ayarlanabilir ve iptal edilebilir olmalı.
- **Her etkileşimin üç geri bildirimi:** hover (görsel), seçim (ses/haptik), sonuç (durum değişimi). Sessiz buton mekânsalda kayıptır.
- **Controller paritesi.** El takibi olan cihazda controller, controller olan cihazda el takibi yedeği. Tek girdiye bağlı eylem, o girdisi olmayan kullanıcı için yoktur.
- **Metin girişi** sistem klavyesi veya dikte; özel 3B klavye son çare.

### 9.4 Konfor

Mekânsal slop'un en pahalı hatası konforsuzluktur. Pazarlık yok:

- **Kamera hareketi kullanıcı iradesi olmadan olmaz.** Baş sallanması (head bob), rulo, ivme, ani duruş yok.
- **Varsayılan hareket:** teleport + snap turn (30–45°). Smooth locomotion bir seçenek, varsayılan değil.
- **Smooth locomotion açıksa:** vignette, hız sınırı, sabit ufuk, oturma modu.
- **Yeniden ortalama** tek jestle, her an erişilebilir. Boy kalibrasyonu ilk açılışta.
- **Oturma modu** ayrı bir mod değil, birinci sınıf seçenek.
- **Sabit referans:** bir masa, bir zemin, bir pencere. Tamamen yüzen arayüz yön kaybı yaratır.
- **Uzun oturumlar:** 20 dakikada bir kullanıcıya ara verme fırsatı; passthrough'a geçiş kolay.

### 9.5 Mekânsal belirtiler

Yukarıdaki tabloda kimlikleri var; burada neyin neden slop olduğu:

- **Kafaya kilitli HUD.** Kullanıcı başını çevirdiğinde menü de döner; dünyada sabit bir referans yoktur, bulantı ve yön kaybı başlar. Sadece kısa bildirimler kafaya kilitlenebilir.
- **Cam her yerde.** Her panel yarı saydam ve parlak olunca metin passthrough ile yarışır; kontrast düşer, derinlik algısı bozulur. Cam chrome'a, opak yüzey içeriğe.
- **Bloom ve parlama.** Her şey parlayınca hiyerarşi kalmaz; göz en parlak şeye gider, en önemli şeye değil.
- **Boşlukta yüzen web sayfası.** İki boyutlu yerleşimi üç boyuta taşımak, mekânsal tasarım değildir. Panelin içinde web varsa, panelin kendisi bir mekân nesnesi gibi davranmalı.
- **1° altı metin.** Ekran görüntüsünde net görünür, başlıkta okunmaz. Statik inceleme bunu yakalayamaz; açısal ölçü ve cihaz testi gerekir.
- **Zorunlu smooth locomotion.** İlk deneyimde bulantı, ikinci açılışta silme. Teleport varsayılan.
- **Geri bildirimsiz etkileşim.** Sessiz buton, mekânsalda "çalışmıyor" olarak okunur.
- **Oyuncak bebek avatar.** İnsan temsili ne kadar gerçekçi olmaya çalışırsa o kadar rahatsız eder; stilize veya soyut temsil daha güvenli.
- **Altyazısız ses.** Mekânsal ses bir kanal; metin alternatifi olmadan erişilemez.

### 9.6 Kare bütçesi

| Hz | Bütçe | Not |
|---|---|---|
| 72 | 13,9 ms | Quest varsayılanı; altına inmemeli |
| 90 | 11,1 ms | Standart hedef |
| 120 | 8,3 ms | Üst segment; pazarlama değil, konfor |

Kurallar: kare başına ayırma yok; `GetComponent`/`find` kare içinde yok; gerçek zamanlı gölge ve bloom kapalı veya bake; materyal sayısı ve draw call düşük; foveated rendering açık; geç latching (late-latching) destekleniyorsa kullan; stereo çizim yükünü unutma.

### 9.7 Mekânsal inceleme protokolü

1. Cihazda aç, masaüstü önizlemede değil.
2. Üç mesafede oku: 0,5 m, 1,5 m, 3 m.
3. Oturarak ve ayakta; el takibi ve controller ile.
4. 15–30 dakika kesintisiz kullan; bulantı, göz yorgunluğu, boyun ağrısı not et.
5. Performans overlay'i ile kare süresini ölç; "72'nin altına düştü" bir bulgudur.
6. Passthrough parlak ve karanlık ortamda kontrastı kontrol et.
7. En büyük metin ve VoiceOver/Dwell ile dene.
8. Ekran görüntüsüyle "geçti" deme. Mekânsalda statik kanıt yoktur.

## 10. Ürün mimarisi

### 10.1 Beş katman

| Katman | Sorumluluk | Nerede |
|---|---|---|
| **Katalog** | Kural verisi: kimlik, aile, önem, platform, desen, düzeltme | `packages/rules/` |
| **Motor** | Deterministik tarama, puanlama, parmak izi, muafiyet | `packages/detect/`, `packages/core/` |
| **Protokol** | Ajanın ne zaman ne yapacağı, çıktı sözleşmesi, öz kontrol | `skills/slopdrop/` |
| **Hafıza** | Proje bağlamı, bulgular, ziyaretler, olay günlüğü | `packages/mcp/` + SQLite |
| **Yüzeyler** | CLI, plugin'ler, CI, editör, gelecekte web | `packages/cli/`, `plugins/`, `apps/` |

Kural: **veri aşağı akar, yukarı akmaz.** Katalog hiçbir şeyi import etmez. Motor kataloğu okur. Protokol motoru çağırır. Hafıza protokolün yazdığını saklar. Yüzeyler hepsini birbirine bağlar.

### 10.2 Repo haritası

```text
slopdrop/
├─ README.md                     ürün yüzeyi
├─ DESIGN.md                     bu doküman
├─ ARCHITECTURE.md               sistem haritası (İngilizce)
├─ docs/
│  ├─ manifesto.md               kısa ilkeler
│  ├─ taxonomy.md                kopya + arayüz + mekân taksonomisi
│  ├─ scoring.md                 puanlama ve bantlar
│  ├─ treatment.md               triyaj, yön, geçişler, taban, muafiyet
│  ├─ platform-matrix.md         yüzey tablosu ve yığın notları
│  ├─ spatial.md                 VR/XR referansı
│  ├─ mcp-sync.md                yerel-öncelikli senkron
│  ├─ data-model.md              tablolar, olaylar, çakışma
│  ├─ agent-protocol.md          MCP araç sözleşmeleri
│  ├─ research.md                kanıt, yöntem, sınırlar
│  ├─ brand.md                   SLOPDROP'un kendi tasarım dili
│  └─ glossary.md                terimler
├─ skills/slopdrop/
│  ├─ SKILL.md                   ajan protokolü (kısa, her çağrıda yüklenir)
│  ├─ eval.md                    teslim öncesi kontrol listesi
│  ├─ agents/openai.yaml         ajan manifesti
│  ├─ scripts/detect.js          paketlenmiş dedektör köprüsü
│  └─ reference/                 talep üzerine yüklenen rehberler
│     ├─ tells.md  copy.md  platforms.md  spatial.md
│     ├─ treatment.md  report.md  chart.md  performance.md
├─ packages/
│  ├─ rules/                     JSON katalog + şema doğrulama + fixture'lar
│  ├─ core/                      saf fonksiyonlar (puan, önem, parmak izi)
│  ├─ detect/                    CLI tarayıcı
│  ├─ mcp/                       MCP sunucusu, SQLite şeması, göçler
│  └─ cli/                       slopdrop komutları
├─ plugins/
│  ├─ claude/.claude-plugin/plugin.json
│  └─ codex/.codex-plugin/plugin.json
├─ evals/                        altın vakalar
├─ examples/                     önce/sonra fixture'ları ve örnek tedavi
└─ .github/workflows/            test, paket, yayın
```

### 10.3 Katalog neden veri

Bir kural eklemek için motoru değiştirmek gerekirse, 100 kuraldan sonra motor okunamaz hâle gelir. Bu yüzden kural bir JSON nesnesidir:

```json
{
  "id": "copy.oops-error",
  "family": "copy",
  "severity": "noticeable",
  "platforms": ["mobile", "web", "desktop", "spatial"],
  "stacks": ["js", "swift", "kotlin", "dart", "xml", "web"],
  "message": "\"Oops\" or \"Something went wrong\": no cause, no next step.",
  "fix": "Say what failed in the product's words and what the user can do: retry, check the connection, contact support.",
  "patterns": ["\\boops\\b", "something went wrong"],
  "exclude": ["//\\s*slopdrop-ignore"],
  "since": "0.1.0"
}
```

Kurallar:

- Kimlik `aile.ad` biçiminde, kararlı ve append-only.
- Her kuralın bir **düzeltmesi** olmak zorunda; düzeltmesi olmayan kural, şikayettir.
- Her kuralın en az bir **pozitif** ve bir **negatif** fixture'ı olur.
- Kural, platform ve yığın kapılarıyla sınırlanır; mobil uygulamada hover, web sitesinde hover sorun değildir.
- Kural "neden" alanı taşır: bir kullanıcı şikayeti, platform yönergesi veya ölçüm. Gerekçesiz kural varsayımdır ve öyle etiketlenir.

### 10.4 Dedektörün altı ilkesi

1. **Sıfır bağımlılık, sıfır ağ, sıfır model.** `node` ile çalışır, projeyi import etmez, kodu çalıştırmaz.
2. **Deterministik çıktı.** Aynı girdi, bayt bayt aynı çıktı. Sıralama kararlı, yollar göreli, zaman damgası yok.
3. **Yorumları boşalt, kod offetlerini koru.** Yorumlanmış kod asla eşleşmez; satır numaraları kaymaz.
4. **Platformu tahmin et, itiraz hakkı ver.** En yakın `package.json` mobile / universal / web der; `--platform` her zaman kazanır.
5. **İsabet kanıttır, bulgu değildir.** Çıktı bunu söyler; ajan bağlamda doğrular.
6. **Sessizleştirme açık olsun.** Satır içi `// slopdrop-ignore <id>` veya proje `.slopdrop/config.json`. Sessizleştirme gerekçesizse chart'a yazılır.

Çıkış kodları: `0` temiz, `2` bulgu var, `1` hata. `2` bir CI kapısıdır; `0` "sağlıklı" demek değildir, sadece "kural yok" demektir.

### 10.5 Beceri katmanı

`SKILL.md` kısa olmak zorunda; her çağrıda bağlama girer. Uzun katalog `reference/` altında talep üzerine yüklenir. Bu, ilerlemeli açığa çıkarma (progressive disclosure) modeli:

| Dosya | Ne zaman yüklenir | Yaklaşık boyut |
|---|---|---|
| `SKILL.md` | Her zaman | 200–250 satır |
| `reference/tells.md` | Teşhis adımında | 150 satır |
| `reference/copy.md` | Kopya işinde | 150 satır |
| `reference/platforms.md` | Platform adımında | 200 satır |
| `reference/spatial.md` | Mekânsal işte | 150 satır |
| `reference/treatment.md` | Tedavi vakasında | 120 satır |
| `reference/report.md` | Rapor yazarken | 90 satır |
| `eval.md` | Teslimden önce | 60 satır |

Beceri, paketler kurulu olmadan da çalışmalı: dedektör yoksa "kontrol edilmedi" der, MCP yoksa chart'ı dosyadan okur. Eksik yetenek, sessiz başarısızlık değil, açık bir eksiklik satırıdır.

### 10.6 Dağıtım yüzeyleri

| Yüzey | Ne | Nasıl |
|---|---|---|
| Beceri | `skills/slopdrop/` | `npx slopdrop install`, elle kopyalama, `skills` CLI |
| Claude plugin | `.claude-plugin/plugin.json` | marketplace + install |
| Codex plugin | `.codex-plugin/plugin.json` | `codex plugin marketplace add` |
| npm | `slopdrop` | `npx slopdrop ...` |
| CI | GitHub Action | `slopdrop detect --json`, eşik kontrolü |
| MCP | stdio / localhost | Claude Desktop, Antigravity, Codex, Cursor |
| Editör | VS Code eklentisi (M1) | tanılama olarak bulgular |

Paketlemede tek kural: **paketlenen `SKILL.md` kanonik dosyayla bayt bayt aynı olmalı.** Build bunu doğrulamazsa, sürümler birbirinden kayar.

### 10.7 Sürümleme

- Kural kimlikleri append-only. Silme veya yeniden adlandırma major sürüm ve eşleme dosyası ister.
- MCP araç yüzeyi semver: yeni araç minor, değişen argüman major.
- SQLite şeması ileriye doğru göç eder; `meta.schema_version` taşır.
- Beceri sürümü paket sürümünü takip eder; plugin manifestleri build'de okur.

---

## 11. Yerel-öncelikli beyin

### 11.1 Neden

Üç ajan aynı projede çalışırken üç ayrı bağlam oluşur: Claude Desktop chart'ı bilir, Antigravity bilmez; Codex bir bulguyu düzeltir, diğer ikisi eski bulguyu gösterir. Kullanıcı aynı bilgiyi üç kez anlatır, üç ajan birbirinin işini bozar.

Bulut çözümü yanlış: kaynak kodu, ekran görüntüsü ve tasarım kararları dışarı çıkmamalı; gecikme olmamalı; çevrimdışı çalışmalı; kullanıcı hesap açmamalı. Bu yüzden beyin **yerel**, **tek dosya**, **metinle taşınabilir**:

- `.slopdrop/project.db` — SQLite, WAL modu.
- MCP üzerinden stdio; gerekirse `127.0.0.1` HTTP.
- Metin artefaktları (`chart.md`, `findings.jsonl`, `visits/`) git'e girer; DB git'e girmez.
- DB kaybolursa metinden yeniden kurulur.

### 11.2 İki mod

| Mod | Nasıl | Ne zaman |
|---|---|---|
| **Paylaşılan dosya** | Her istemci kendi MCP sürecini başlatır, aynı DB'yi açar. SQLite WAL + `busy_timeout` + iyimser rev. | v0, tek kullanıcı, üç istemci, aynı makine |
| **Daemon** | Tek süreç DB'nin sahibi; istemciler stdio köprüsü veya localhost HTTP ile bağlanır; abonelik/olay yayını. | v1, çok kullanıcı, uzun oturumlar, canlı güncelleme |

Paylaşılan dosya modu doğruluk açısından yeterlidir (SQLite yazarı serileştirir), daemon modu gecikmeyi ve canlı bildirimi çözer.

### 11.3 Veri modeli

| Tablo | İçerik | Not |
|---|---|---|
| `meta` | şema sürümü, proje kimliği | tek satırlık anahtar/değer |
| `actors` | `claude-desktop`, `antigravity`, `codex`, `cli`, `human` | her yazmanın sahibi |
| `documents` | chart, token'lar, kurallar önbelleği | `kind` + `slug`, `rev` |
| `findings` | kural, dosya, satır, parmak izi, durum | `fingerprint` tekil |
| `visits` | kapsam, puanlar, rapor markdown | zaman sıralı |
| `waivers` | kural, kapsam, neden, onaylayan | süreli olabilir |
| `events` | append-only olay günlüğü | `seq` artan, senkron imleci |
| `cursors` | ajan başına son görülen `seq` | artımlı çekme |
| `conflicts` | çakışan alan, iki değer, çözüm | sessiz üzerine yazma yok |

`events` her yazmanın omurgasıdır: `(seq, id, at, actor, entity, entity_id, op, patch, base_rev, rev, idem)`. `idem` tekil; aynı istek iki kez gelirse ikinci kez uygulanmaz, ilk sonuç döner.

### 11.4 Yazma protokolü

```text
1. istemci: chart_patch { baseRev: 7, patch: {...}, idem: "uuid" }
2. sunucu: BEGIN IMMEDIATE
3. rev hâlâ 7 mi?  değilse -> alan bazlı birleştirme dene
4. çakışma yoksa uygula, rev 8, event yaz, commit
5. çakışma varsa conflicts satırı yaz, 409 + iki değer döndür
```

- **Alan bazlı son yazan kazanır (LWW).** Aynı alanı iki ajan farklı değere çekerse, `at` sonra olan kazanır; eşitlikte `actor` kimliği deterministik kırar.
- **İnsan kazanır.** `actor.kind = human` ise, ajanın aynı alandaki yazması çakışma penceresinde (varsayılan 10 dk) otomatik kaybetmez; çakışma kaydı açılır ve insan karar verir.
- **Muafiyet onay ister.** `waiver_add` bir ajan tarafından çağrılırsa `status = proposed`; insan onaylamadan chart'a "kabul edildi" olarak geçmez.
- **Bulgular ekleme-only.** Aynı parmak izi ikinci kez gelirse yeni satır açılmaz, `last_seen` güncellenir.
- **Rev, iyimser kilittir.** Çakışma bir hata değil, bir olaydır; kaydedilir ve çözülür.

### 11.5 Metin köprüsü

DB, insan için okunmaz. İnsan için doğru olan metindir:

| Artefakt | Sahibi | Git'e girer |
|---|---|---|
| `.slopdrop/chart.md` | insan + ajan, onaylı | evet |
| `.slopdrop/findings.jsonl` | dedektör + ajan | evet (istenirse) |
| `.slopdrop/visits/*.md` | ajan | evet |
| `.slopdrop/visits.jsonl` | ajan (dışa aktarım) | evet |
| `.slopdrop/waivers.json` | insan onaylı | evet |
| `.slopdrop/project.db` | sunucu | hayır |
| `.slopdrop/config.json` | insan | evet |

`sync export` DB'den metni yazar; `sync import` metni okur ve eksik olayları üretir. Böylece DB silinse bile proje geçmişi durur; iki geliştirici aynı metni paylaşarak çalışabilir.

### 11.6 Üç istemci, üç config

**Claude Desktop** (`%APPDATA%\Claude\claude_desktop_config.json` Windows'ta, `~/Library/Application Support/Claude/` macOS'ta):

```json
{
  "mcpServers": {
    "slopdrop": {
      "command": "npx",
      "args": ["-y", "slopdrop", "mcp", "serve", "--project", "C:/work/app"]
    }
  }
}
```

**OpenAI Codex** (`~/.codex/config.toml`):

```toml
[mcp_servers.slopdrop]
command = "npx"
args = ["-y", "slopdrop", "mcp", "serve", "--project", "."]
startup_timeout_sec = 20
```

**Google Antigravity** (`~/.gemini/config/mcp_config.json` global, `.agents/mcp_config.json` proje):

```json
{
  "mcpServers": {
    "slopdrop": {
      "command": "npx",
      "args": ["-y", "slopdrop", "mcp", "serve", "--project", "."]
    }
  }
}
```

`slopdrop mcp install` bu üç dosyayı bulur, mevcut `mcpServers` nesnesine dokunmadan ekler, yedeğini alır ve neyi değiştirdiğini yazar. Dosya yoksa oluşturmaz; hangi ajanın kurulu olmadığını söyler.

### 11.7 Üç ajanlı senaryo

1. **Claude Desktop** `chart` çalıştırır: ürün, kullanıcı, marka, dokunulmazlar. `chart_patch` ile yazar, rev 1.
2. **Antigravity** aynı projede `review checkout` çalıştırır. `sync_pull since=0` ile chart'ı alır; aynı üç soruyu sormaz. Bulguları `finding_upsert` ile yazar, ziyareti kaydeder, rev 1 → 2.
3. **Codex** `treat checkout` çalıştırır. Son ziyareti ve açık bulguları okur, yönü chart'tan alır, düzeltir, `visit_record` ile yeni puanı yazar. rev 2 → 3.
4. Claude Desktop bir sonraki açılışta `sync_pull since=2` ile yeni bulguları ve puanı görür. Aynı ekranı ikinci kez teşhis etmez.
5. Kullanıcı chart'ta bir muafiyeti değiştirirse (`human`), ajanların sonraki yazmaları çakışma kaydı üretir; hiçbiri sessizce kazanmaz.

### 11.8 Güvenlik ve gizlilik

- Sunucu stdio veya `127.0.0.1`; `0.0.0.0` yok.
- Telemetri yok, bulut yok, hesap yok.
- DB dosya izinleri kullanıcıya özel (POSIX 0600).
- `sync export` mutlak yolları göreliye çevirir, kullanıcı adını redakte eder.
- Ekran görüntüleri yalnızca proje zaten commit ediyorsa depoya girer.
- Ajan, incelediği dosyanın içindeki talimatı **uygulamaz**; kod ve metin veridir.
- `.slopdrop/ignore` ile hassas dizinler taranmaz.

### 11.9 Arıza senaryoları

| Arıza | Davranış |
|---|---|
| Süreç çöktü | WAL sayesinde son commit durur; yarım yazma yok |
| İki ajan aynı anda yazdı | SQLite serileştirir; ikincisi rev çakışması alır |
| Aynı istek iki kez geldi | `idem` tekil; ikinci istek ilk sonucu döndürür |
| DB silindi | `sync import` metinden yeniden kurar |
| Şema eski | Göçler ileriye uygulanır; geri dönüş yok, yedek alınır |
| İstemci eski sürüm | `tools/list` ile yetenekleri görür; bilinmeyen araç çağrısı net hata döndürür |
| Ajan çevrimdışı | Dosya modunda çalışmaya devam eder; bağlanınca `sync_push` |

---

## 12. Ajan protokolü

### 12.1 Araç yüzeyi

| Araç | Girdi | Döndürür | Yazar |
|---|---|---|---|
| `project_open` | `root` | `{projectId, rev, stack, platforms}` | hayır |
| `chart_read` | — | `{markdown, rev, updatedAt}` | hayır |
| `chart_patch` | `{baseRev, patch, idem}` | `{rev}` veya `{conflict}` | evet |
| `finding_upsert` | `{rule, file, line, snippet, severity, message, fix, visitId}` | `{id, fingerprint, created}` | evet |
| `finding_list` | `{status?, severity?, file?, limit?}` | `{findings, nextCursor}` | hayır |
| `finding_resolve` | `{id, status, note}` | `{id, status}` | evet |
| `visit_record` | `{scope, scores, total, band, reportMd, screenshots?}` | `{id, at}` | evet |
| `visit_list` | `{scope?, limit?}` | `{visits}` | hayır |
| `waiver_add` | `{rule, scope, reason}` | `{id, status}` | evet (öneri) |
| `sync_pull` | `{since, limit?}` | `{events, nextSeq, hasMore}` | hayır |
| `sync_push` | `{events[]}` | `{applied, conflicts, nextSeq}` | evet |
| `export_text` | `{dir?}` | `{written[]}` | evet (dosya) |
| `import_text` | `{dir?}` | `{events}` | evet |
| `score_compute` | `{findings, estimates}` | `{dimensions, total, band, index}` | hayır |

Kaynaklar: `slopdrop://chart`, `slopdrop://chart/history`, `slopdrop://findings?status=open`, `slopdrop://visits/latest`, `slopdrop://rules/{id}`.

### 12.2 Ne zaman hangisi

- **Dosya, varsayılan.** Chart, config, rapor ve ziyaretler metin olarak okunur; ajan zaten dosya okuyabilir.
- **MCP, paylaşım gerektiğinde.** Üç ajan aynı projede, artımlı senkron, çakışma kaydı, kalıcı bulgu kimliği.
- **Dedektör, kanıt gerektiğinde.** Deterministik tarama; ajanın gözüne güvenmediğimiz desenler.
- **İkisi birden, normal.** Ajan dosyayı okur, dedektörü çalıştırır, sonucu MCP'ye yazar.

### 12.3 Bağlam bütçesi

- `SKILL.md` her çağrıda yüklenir; 250 satırı geçmez.
- Referanslar talep üzerine: önce `tells.md`, sonra platform dosyası.
- Raporlar tekrar okunmaz; puan ve özet yeter.
- Chart bir sayfayı geçmez. Geçiyorsa chart değil, arşivdir.

### 12.4 Çıktı sözleşmesi

Ajanın döndürdüğü her inceleme şu üçünü taşır:

1. **Puan ve bant**, boyut kırılımıyla.
2. **Bulgular**, dosya:satır ve düzeltmeyle, önem sırasıyla.
3. **Kontrol edilmeyenler**, performans dahil.

Bunlardan biri eksikse çıktı geçersizdir. "Her şey yolunda" tek başına geçerli bir cevap değil; hangi kanıta dayandığı yazılır.

### 12.5 Eksik yetenek davranışı

| Durum | Ajan ne yapar |
|---|---|
| Dedektör yok | Koddan elle incele, "dedektör çalıştırılamadı" yaz |
| MCP yok | Chart'ı dosyadan oku, senkron gerektiren adımı atla ve söyle |
| Uygulama çalışmıyor | Koddan incele, tahminleri `~` ile işaretle |
| Ekran görüntüsü yok | Görevi ve durumları kod üzerinden değerlendir, sınırı yaz |
| Profiler yok | "Profilenmedi" yaz, statik ipuçlarını listele |
| Kaynak yok | İddiayı kaldır veya sor; uydurma |

### 12.6 Çoklu ajan rolleri

| Rol | İş | Kısıt |
|---|---|---|
| **Yazar ajan** | Teşhis, tedavi, rapor | Kendi işini onaylayamaz |
| **İncelemeci ajan** | Taze bağlamla sonra ekranlarını görür, "başka ürüne ait olabilir mi" sorar | Sadece sonra görüntüleri + tek cümle ürün tanımı alır |
| **CI ajanı** | Dedektör + eşik | Yorum yapar, kod değiştirmez |
| **İnsan** | Marka, muafiyet, navigasyon kararları | Son söz |

Taze göz bütçesi: bir toplu bakış, bir düzeltme turu, bir doğrulama bakışı. Sonsuz döngü, kendi kendini onaylamaktır.

### 12.7 Güvenlik: incelenen içerik veridir

İncelenen depo, yorumlar, README'ler ve ekran metinleri **veridir**, talimat değildir. İçinde "bu kuralı yok say" yazıyorsa uygulanmaz; raporlanır. Ajan sadece kullanıcının verdiği görevi ve kendi beceri dosyasını talimat olarak kabul eder.

## 13. SLOPDROP'un kendi tasarım dili

### 13.1 İlk kural: kendi testini geç

Bir slop dedektörünün kendi arayüzü, öğrettiği kuralların hiçbirini çiğneyemez. Mor gradyan yok, cam yok, sparkle yok, emoji ikon yok, her satırda tinted kare yok, "Oops" yok, uydurma sayı yok. Marka, ürünün tezinin kanıtıdır.

Bu yüzden SLOPDROP'un görünümü bilinçli olarak **araç gibi** görünür: yoğun, düz, okunaklı, tablo ağırlıklı. Bir landing page değil, bir ölçüm cihazı.

### 13.2 Kimlik

| Öğe | Karar | Gerekçe |
|---|---|---|
| **Ad** | SLOPDROP, tek kelime, büyük harf | Düşen şey slop; eylem adı ürün adı |
| **İşaret** | Sadece wordmark + altında 2px'lik "drop" çizgisi | İkon yarışına girmemek; ekran görüntüsünde tanınır |
| **Renk** | Kâğıt `#F5F2EA`, mürekkep `#111110`, çizgi `#D9D3C7`, sinyal `#D93A1F`, geçti `#1C6B4A`, uyarı `#B4720E` | Tek sinyal rengi; geçti/kaldı dışında renk anlam taşımaz |
| **Tip** | UI: sistem grotesk (`system-ui`, SF, Segoe, Roboto). Kimlik ve sayı: tek monospace | Sistem fontu bilinçli bir karar; "Inter çünkü modern" değil |
| **Izgara** | 4/8/12/16/24/32/48 | Tek ölçek, her yerde |
| **Yarıçap** | 0 (kartlar), 2px (input) | Yuvarlak köşe bir varsayılan değil, bir karar olmalı |
| **Yükseklik** | Kenarlık, gölge yok | Gölge hiyerarşi taşımıyorsa gürültüdür |
| **Hareket** | 120 ms opacity; başka bir şey yok | Reduce Motion varsayılanı zaten bu |
| **Yoğunluk** | Satır yüksekliği 1,45; tablo hücresi 8px dolgu | Günde defalarca kullanılan araç |

Yasaklar: gradyan, blur, glow, emoji, sparkle, 3B illüstrasyon, "AI" rozeti, sayaç animasyonu, hover'da büyüme, sonsuz nabız, carousel, ortalanmış hero.

### 13.3 Bileşenler

- **Hüküm kartı.** Üstte tek cümle hüküm, altında 24'lük puan ve altı boyut, en altta bant etiketi. Renk sadece bantta.
- **Bulgu satırı.** `dosya:satır` monospace, önem etiketi, tek cümle sorun, tek cümle düzeltme. Satır tıklanınca kod açılır.
- **Puan tablosu.** Altı satır, sıfır–dört, gerekçe. Gösterge (gauge) yok; sayı ve tablo yeter.
- **Önce/sonra.** Aynı ekran, aynı veri, aynı cihaz, aynı görünüm. Etiketler görüntünün üstünde, ortada değil.
- **Chart görünümü.** Markdown, düzenlenebilir; kaydedince rev artar ve diğer ajanlara olay gider.
- **Diff görünümü.** Ekleme/çıkarma sayısı üstte, renk sadece `+`/`−` işaretinde.

### 13.4 Ses

Kuru, spesifik, hastayı değil ekranı eleştiren bir dil. Mizah nadir ve kısa. Övgü yok; "harika" demek yerine neyin iyi olduğunu söyle.

İyi hükümler:

- *"Sipariş butonu taşınmış, liste takılıyor ve dashboard kimsenin ölçmediği sayılar raporluyor."*
- *"Dört kart, iki hamburger menü ve yanlış yere giden bir geri butonu."*
- *"Ekran temiz. Logoyu kapatınca hangi ürün olduğu da anlaşılmıyor."*
- *"Üç gradyan, iki sparkle ve bir tane bile gerçek sayı yok."*

Kötü hükümler:

- *"Klasik AI slop."* Genel; tedavi ettiğimiz şeyin ta kendisi.
- *"Tasarımınız berbat."* Kişiye, ekrana değil.
- *"Harika görünüyor!"* Ölçüsüz övgü, rapor değil.

Kendi kopyamızda yasak: seamless, effortless, supercharge, unlock, elevate, "AI-powered", "next-generation", "built for the future", "trusted by", ünlem, emoji.

### 13.5 CLI ve doküman estetiği

```text
$ slopdrop scan src/
14 findings in 9 of 212 files (2 critical, 7 noticeable, 5 minor)

src/screens/Home.tsx
    42  critical    ux.keyboard-cover      Text input inside a ScrollView with no keyboard handling
   118  noticeable  ui.nested-cards        Card inside a card
   204  minor       copy.welcome-back      "Welcome back!" takes the top of the screen

Static checks only. Nothing was run, profiled, or tapped.
```

- Hizalı sütunlar, renk yok (terminal çıktısı boru hattına gider).
- Her çıktının sonunda tek satırlık sınır cümlesi.
- Emoji yok. Kutu çizimi yok. Süs yok.
- Yardım metni örneklerle, örnekler gerçek dosya adlarıyla.

---

## 14. Yüzeyler ve ürün fikirleri

Aşağıdakilerin hepsi aynı katalogdan beslenir. Öncelik sırası: bir sonraki sütunu besleyen, ondan önce gelir.

### Şimdi (M0–M1)

1. **Beceri.** `/slopdrop review|treat|scan|chart|follow-up`. Ürünün kalbi; kurulumu en kolay yüzey.
2. **CLI.** `init`, `scan`, `detect`, `install`, `sync`. CI'ya giden yol.
3. **MCP beyni.** Üç ajan, tek proje. Fark yaratan şey bu; tek başına beceri de olur ama paylaşılan hafıza olmadan her ajan sıfırdan başlar.
4. **GitHub Action.** PR'da dedektör + eşik + yorum. Yeni kullanıcı için en düşük sürtünme.
5. **Pre-commit hook.** Değişen dosyalarda sadece yeni bulgular.
6. **README rozeti.** `slop index: 12/100`; gönüllü, utandırmayan.

### Sonra (M2)

7. **VS Code / Cursor eklentisi.** Bulgular tanılama olarak, tıklayınca düzeltme önerisi.
8. **Tarayıcı eklentisi.** Canlı sayfada katman: kural isabetini göster, "neden" ve "düzeltme" paneli.
9. **Figma eklentisi.** Frame'leri tara, token'ları oku, "bu ekran hangi ürün" testini çalıştır.
10. **Token denetçisi.** Tasarım token'larını katalogla karşılaştır: tek vurgu, ölçek, semantik roller, yarıçap, hareket.
11. **Mekânsal kit.** Unity paketi + visionOS yardımcıları: açısal ölçü, kare bütçesi, konfor ayarları, recenter.
12. **Kopya API'si.** Metni gönder, desenleri ve düzeltilmiş hâli al. İçerik ekipleri için.
13. **Slop-Bench.** Modelleri "slop'u bulma ve düzeltme" üzerinde ölçen açık değerlendirme seti. Kategori lideri olmanın yolu, ölçüyü tanımlamaktan geçer.

### Ufuk (M3+)

14. **Takım panosu.** Self-hosted; proje bazında trend, tekrar eden kurallar, muafiyet borcu.
15. **Tasarım sistemi başlangıcı.** "Şablon değil, senin markan": jenerik olmayan, üründen türetilmiş token seti.
16. **Eğitim.** Kuralın neden var olduğunu önce/sonra ile anlatan kısa dersler.
17. **"No Slop" sertifikası.** Denetimden geçen ürünler için rozet; gelir modeli olabilir, güven modeli olmak zorunda.
18. **Sektör kural paketleri.** Fintech, sağlık, kamu: aynı çekirdek, farklı taban ve mevzuat notları.
19. **Ajan pazarı.** Kural paketi yazana gelir payı; katalog ekosistemi.
20. **Mekânsal mağaza denetimi.** Vision Pro / Quest uygulamaları için "mağaza öncesi" kontrol listesi.

Riskler: 14–20, çekirdek ürün kanıtlanmadan gelir getirmez. Sıra, çekirdeğin gerçekten çalıştığını göstermeden ilerlememeli.

---

## 15. Yol haritası

| Aşama | Kapsam | Çıkış ölçütü |
|---|---|---|
| **M0 — Çekirdek** | Katalog (68 kural: 48 deterministik, 20 yargı kuralı), puanlama, dedektör, SKILL.md + referanslar, CLI `scan` | Dedektör 6 yığında fixture'ları geçiyor; beceri tek başına çalışıyor; 10 gerçek repoda yanlış pozitif oranı <%20 |
| **M1 — Paylaşılan hafıza** | SQLite şeması, MCP araçları, `mcp install`, sync export/import, Claude + Codex + Antigravity kurulumu | Üç istemci aynı projede chart ve bulguları paylaşıyor; çakışma kaydı ve idempotency testleri geçiyor |
| **M2 — Yüzeyler** | GitHub Action, VS Code eklentisi, web playground, mekânsal kit | İlk dış kullanıcı PR'da bulgu alıyor; mekânsal inceleme cihazda çalışıyor |
| **M3 — Ölçek** | Kural paketleri, takım panosu, Slop-Bench, sertifika | 100+ kural, 3 sektör paketi, yayınlanmış benchmark |
| **M4 — Ekosistem** | Pazar, API, eğitim | Dışarıdan kural yazan ilk 10 katkıcı |

Her aşamanın sonunda tek soru: **kullanıcı bir sonraki incelemede daha az kritik bulgu alıyor mu?** Cevap hayırsa, aşama bitmemiştir.

---

## 16. Metrikler

**Kuzey yıldızı:** inceleme başına düzeltilen doğrulanmış kritik bulgu sayısı. Aktivasyon değil, sonuç.

| Metrik | Neden | Hedef (M2) |
|---|---|---|
| İlk bulguya süre | Kurulumun gerçekten kolay olduğunu gösterir | < 3 dk |
| Doğrulanmış bulgu / toplam isabet | Dedektörün gürültüsü | > %60 |
| Tekrar eden bulgu oranı | Ajanın gerçekten düzelttiğini gösterir | < %15 |
| Muafiyet borcu | Susturulan ama çözülmeyen bulgular | < 10 / proje |
| Senkron çakışması | Çoklu ajan mimarisinin sınavı | Kaydedilir, sıfır sessiz kayıp |
| Sağlıklı ekran oranı | Aracın sağlıklıyı rahat bıraktığını gösterir | > %20 |
| NPS / "tekrar kullanır mısın" | Ürün-pazar uyumu | > 40 |

Yanlış pozitif, yanlış negatiften daha pahalıdır: bir kez "bu slop" diyen araç, doğru söylediğinde de dinlenmez.

---

## 17. Riskler, etik, açık sorular

### Riskler

| Risk | Etki | Karşılık |
|---|---|---|
| Zevk polisliğine kaymak | Güven kaybı, kullanıcı direnci | Kural = kanıt; her bulgu dosya:satır; "sağlıklı" demeyi öğrenmek |
| Yeni bir varsayılan dayatmak | Tedavi sonrası ekran yine jenerik | "Logoyu kapat" ve komşu testi; token'lar markadan |
| Dedektörün gürültüsü | Aracın yok sayılması | Fixture disiplini, yanlış pozitif önceliği, <%20 eşiği |
| Platform kapsamının patlaması | Sığ kural seti | Yığın başına derinlik; "desteklenmiyor" demek |
| Mekânsal iddiaların yanlış olması | Ciddi güven kaybı | Cihazda test; HIG'e atıf; ölçülemeyeni işaretleme |
| Çoklu ajan senkronunun çakışması | Veri kaybı algısı | Rev + olay + çakışma kaydı; metin yedeği |
| Büyük modelin aynı işi yapması | Değer kaybı | Deterministik kanıt + yerel hafıza + protokol; modelden bağımsız olmak |
| Açık kaynak kural hırsızlığı | Topluluk tepkisi | Kaynak ve lisans disiplini; fikirler ödünç, metin ve kod değil |

### Etik

- Kullanıcıyı değil, ekranı eleştir. "Senin tasarımın berbat" demek, insanı hedef alır.
- AI kullanımını suçlama. Araç, kimin yazdığını bilemez; deseni gösterir.
- Uydurma veri üretme. Placeholder'ı placeholder olarak işaretle.
- Erişilebilirliği "bonus" değil, taban say.
- Kullanıcının markasına saygı duy. Marka kararı, estetik kuralını yener.
- Yerel kal. Kaynak kodu ve ekran görüntüsü, kullanıcının makinesinden çıkmaz.

### Ne yapmaz

- Çalışan uygulamayı görmeden "temiz" demez.
- Profil olmadan performansı sağlıklı ilan etmez.
- Testlerin işini yapmaz.
- Bir şablonu başka bir şablonla değiştirmez.
- AI yazarlığını tahmin etmez.
- Navigasyonu, marka kimliğini veya gelir modelini sormadan değiştirmez.

### Açık sorular

1. **Çoklu platform tek skorda mı?** Bir iOS ekranı ile aynı ürünün web ekranı aynı 24'lük puana sahip olmalı mı, yoksa platform başına mı?
2. **Görsel inceleme ne zaman deterministik olur?** Ekran görüntüsünden ölçüm (kontrast, hedef boyutu, taşma) mümkün; bunu dedektöre katmak, "kod okur" ilkesini bozar mı?
3. **Takım çalışmasında kim onaylar?** Muafiyet için tek "insan" rolü yeterli mi, yoksa tasarım sahibi ayrı mı olmalı?
4. **Kural paketleri nasıl sürümlenir?** Çekirdek katalog ile sektör paketleri aynı kimlik uzayını mı paylaşmalı?
5. **Mekânsal puanlama ayrı mı?** Konfor ve okunabilirlik, altı boyutun içine mi girmeli, yoksa mekânsal için yedinci boyut mu?
6. **Ücret modeli.** Açık çekirdek + ücretli takım yüzeyi mi, tamamen açık + sponsorluk mu? Karar, topluluk büyümesini belirler.

---

## 18. Sözlük ve kaynaklar

**Beceri (skill):** Bir ajanın yüklediği, talimat + referans + isteğe bağlı betiklerden oluşan paket.
**Chart:** Projenin duran bağlamı; platform, görev, marka, kabul edilen istisnalar.
**Belirti (tell):** Jenerikliğin gözlemlenebilir işareti; kural kimliği olan veya olmayan.
**Kural:** Dedektörün uyguladığı, kimlikli, önemli ve düzeltmeli veri.
**Bulgu:** Bağlamda doğrulanmış, rapora giren sorun.
**Muafiyet:** Nedenli, kayıtlı, onaylı istisna.
**Ziyaret:** Bir inceleme oturumunun kaydı; puan, rapor, kapsam.
**Bant:** 24'lük puanın sözel karşılığı (temiz, lekeli, slop, derin slop).
**Slop endeksi:** 0–100 türetilmiş ölçü; `(24 − puan) / 24 × 100`.
**Taban (floor):** Her değişen ekranın sağlaması gereken, pazarlık edilemez liste.
**Triyaj:** Ağır / hafif / sağlıklı kararı.
**Yön:** Beş satırlık tasarım kararı (ürün, kullanım, karakter, parlak nokta, imza).
**Yerel-öncelikli:** Verinin kullanıcının makinesinde, tek dosyada, ağ olmadan yaşaması.

**Kaynaklar** (platform gerçekleri için başvuru; ürün metni değil):

- Model Context Protocol: <https://modelcontextprotocol.io>
- Apple Human Interface Guidelines (visionOS dahil): <https://developer.apple.com/design/human-interface-guidelines>
- Material Design 3: <https://m3.material.io>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- Meta Quest tasarım yönergeleri: <https://developers.meta.com/horizon/design/>
- WebXR Device API: <https://www.w3.org/TR/webxr/>
- Google Antigravity MCP yapılandırması: <https://antigravity.google/docs/mcp>
- OpenAI Codex MCP yapılandırması: <https://github.com/openai/codex>

---

### Kapanış yerine: bu dokümanın kendi testi

Logoyu kapat. Bu doküman başka bir "AI ürünü" dokümanına benzeyen yerlerde mi duruyor? Benziyorsa, düzeltilecek yer burasıdır.

Üç şey iddia ediyoruz: slop ölçülebilir, tedavi edilebilir ve ürünün kendisine geri döndürülebilir. Bu iddiaların hiçbiri "daha güzel görünsün" demiyor. Hepsi aynı soruya dayanıyor: **bu ekran, bu ürüne ait mi?**

Cevap hayırsa, iş var.





