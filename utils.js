function to_persian_number(number) {
  const num = new Intl.NumberFormat("fa-IR", {
    useGrouping: false,
  }).format(number);
  return num;
}

function save_data(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function get_saved_data(key, default_value) {
  const data = localStorage.getItem(key);
  if (!data) return default_value;
  return JSON.parse(data);
}

function save_blob(file_name, blob_file) {
  let blob = new Blob([blob_file], { type: "octet/stream" });
  let anchor = document.createElement("a");
  anchor.download = file_name;
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
}

function save_text(file_name, txt) {
  let blob = new Blob([JSON.stringify(txt)], { type: "octet/stream" });
  save_blob(file_name, blob);
}

function read_file(file, on_load) {
  const fileread = new FileReader();
  fileread.onload = (e) => on_load(e.target.result);
  fileread.readAsText(file);
}

function get_form_data(form) {
  const form_data = new FormData(form);
  const form_data_obj = {};
  form_data.forEach((value, key) => (form_data_obj[key] = value));
  return form_data_obj;
}

function load_form(form, data) {
  Object.keys(data).forEach((key) => {
    const input = form.elements[key];
    input.value = data[key];
  });
}

function notify({ type, msg }) {
  alertify.set("notifier", "position", "top-center");
  alertify.notify(msg, type, 5);
}

function notify_success(msg) {
  notify({ type: "success", msg });
}

function notify_error(msg) {
  notify({ type: "error", msg });
}

function confirm({ title, msg, on_ok }) {
  alertify
    .confirm(msg)
    .set("onok", on_ok)
    .set("labels", { ok: "تایید", cancel: "لغو" })
    .setHeader(title);
}

function get_img_from_url(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

function create_pdf_doc() {
  window.jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [297, 210],
  });
  doc.addFont("font/Shabnam.ttf", "Shabnam", "normal");
  doc.setFont("Shabnam");
  return doc;
}

function image_to_base64(img) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(img);
  });
}

function base64_to_image(data_image) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = data_image;
    img.onload = () => resolve(img);
  });
}

function get_base64_image_format(base64) {
  const format = base64.substring(
    "data:image/".length,
    base64.indexOf(";base64")
  );
  return format;
}

function decompress_str(str) {
  return LZString.decompress(str);
}

function compress_str(str) {
  return LZString.compress(str);
}
