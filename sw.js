const cacheName = "certificateMakerCache";
const assetsToCache = [
  "/certificate_maker/",
  "/certificate_maker/index.html",
  "/certificate_maker/main.js",
  "/certificate_maker/manifest.json",
  "/certificate_maker/style.css",
  "/certificate_maker/utils.js",
  "/certificate_maker/font/Shabnam.eot",
  "/certificate_maker/font/Shabnam.ttf",
  "/certificate_maker/font/Shabnam.woff",
  "/certificate_maker/images/certif.jpg",
  "/certificate_maker/images/no_data.jpg",
  "/certificate_maker/images/certificate_template.psd",
  "/certificate_maker/icons/icon-192x192.png",
  "/certificate_maker/icons/icon-256x256.png",
  "/certificate_maker/icons/icon-384x384.png",
  "/certificate_maker/icons/icon-512x512.png",
  "/certificate_maker/icons/award.svg",
  "/certificate_maker/icons/box-arrow-in-down.svg",
  "/certificate_maker/icons/box-arrow-up.svg",
  "/certificate_maker/icons/file-earmark-zip.svg",
  "/certificate_maker/icons/gear-wide.svg",
  "/certificate_maker/icons/list.svg",
  "/certificate_maker/icons/person-circle.svg",
  "/certificate_maker/icons/plus-circle-fill.svg",
  "/certificate_maker/icons/trash3.svg",
  "/certificate_maker/icons/x-octagon-fill.svg",
  "/certificate_maker/libs/jspdf.umd.min.js",
  "/certificate_maker/libs/jszip.min.js",
  "/certificate_maker/libs/lz-string.min.js",
  "/certificate_maker/libs/alertify/alertify.min.js",
  "/certificate_maker/libs/alertify/alertify.rtl.min.css",
  "/certificate_maker/libs/alertify/default.rtl.min.css",
  "/certificate_maker/libs/bootstrap/bootstrap.bundle.min.js",
  "/certificate_maker/libs/bootstrap/bootstrap.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (!response) console.log(event.request);
      return response || fetch(event.request);
    })
  );
});
