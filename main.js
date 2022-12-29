const ALL_DATA_KEY = "ALL_USERS";
const SETTINGS_KEY = "CTF_SETTINGS";
const DEFAULT_SETTINGS = {
  ctf_image: null,
};

const $ = (selector) => document.querySelector(selector);
let form = $("#form");
let data_list = $("#data_list");
let list_number = $("#list_number");
let settings_form = $("#settings_form");
let settings_btn = $("#settings_btn");
let export_btn = $("#export_btn");
let zip_btn = $("#zip_btn");
let import_input = $("#import_input");
let loader = $("#loader");
let current_ctf_img = $("#current_ctf_img");
let ctf_img_input = $("#ctf_img_input");
let remove_all_btn = $("#remove_all_btn");

let data = get_saved_data(ALL_DATA_KEY, []);
let settings = get_saved_data(SETTINGS_KEY, DEFAULT_SETTINGS);

let addData = () => {
  let form_data = get_form_data(form);
  data.push(form_data);
  save_all_data();
  notify_success("با موفقیت ذخیره شد.");
};

let save_all_data = () => {
  save_data(ALL_DATA_KEY, data);
  render_data_list();
};

let render_data_list = () => {
  list_number.innerText = `${to_persian_number(data.length)} نفر`;
  if (data.length) {
    data_list.innerHTML = "";
    data.map((data, i) => {
      const { full_name, n_code } = data;
      return (data_list.innerHTML += `
    <div id=${i} class="data_item d-flex gap-3 p-1">
    <img src="icons/person-circle.svg" alt="person-circle">
    <div>
      <h6 style="margin: 0;">${full_name}</h6>
      <div class="d-flex border-0">
        <span class="text-muted  m-0 mt-1">کد ملی : 
        ${to_persian_number(+n_code)}
        </span>
        </div>
        </div>
        <div class="me-auto my-auto">
        <button class="btn p-1" 
        onClick="export_certificate('${full_name}','${n_code}')"
        data-bs-toggle="tooltip" title="صدور گواهی"
        >
        <img src="icons/award.svg" alt="award">
        </button>
        <button class="btn p-1" onClick="delete_data(this)" 
        data-bs-toggle="tooltip" title="حذف" >
        <img src="icons/trash3.svg" alt="delete">
        </button>
        </div>
        </div>
        `);
    });
  } else {
    data_list.innerHTML = `
    <div class="m-auto" >
    <img class="w-100" src="images/no_data.jpg" alt="no_data" style="max-height: 400px;">
    </div>
    `;
  }
};

const delete_data = (e) => {
  confirm({
    title: "حذف",
    msg: "آیا از حذف اطمینان دارید ؟",
    on_ok: () => {
      data.splice(e.parentElement.parentElement.id, 1);
      notify_success("با موفقیت حذف شد.");
      save_all_data();
    },
  });
};

const load_certificate_image = async () => {
  let img = null;
  let img_format = "jpeg";
  if (settings.ctf_image) {
    const decompressed = decompress_str(settings.ctf_image);
    img = await base64_to_image(decompressed);
    img_format = get_base64_image_format(decompressed);
  } else {
    img = await get_img_from_url("images/certif.jpg");
  }
  return { img, img_format };
};

const create_certificate_doc = async () => {
  let doc = create_pdf_doc();
  const { img, img_format } = await load_certificate_image();
  doc.addImage(img, img_format, 0, 0, 297, 210);
  return doc;
};

const create_certificate = async (full_name, n_code) => {
  const certificate = await create_certificate_doc();
  const name_length = full_name.length;
  const full_name_width = name_length * (name_length < 20 ? 3.5 : 2.75);
  const fontsize = name_length > 20 ? 17 : 20;
  certificate.setFontSize(fontsize);
  certificate.text(full_name, 185 - full_name_width, 114);
  certificate.setFontSize(20);
  certificate.text(to_persian_number(n_code), 43, 115);
  return { certificate, file_name: full_name };
};

const export_certificate = async (full_name, n_code) => {
  loader.classList.add("active");
  const { certificate } = await create_certificate(full_name, n_code);
  setTimeout(() => {
    certificate.save(`${full_name}.pdf`);
    loader.classList.remove("active");
  }, 2000);
};

const create_all_certificates = async () => {
  const promise_list = data.map((dt) =>
    create_certificate(dt.full_name, dt.n_code)
  );
  const all_certificates = await Promise.all(promise_list);
  return all_certificates;
};

const zip_all_certificates = async () => {
  const zip = new JSZip();
  const all_certificates = await create_all_certificates();
  all_certificates.forEach(({ certificate, file_name }) => {
    zip.file(`${file_name}.pdf`, certificate.output("blob"));
  });
  const zip_content = await zip.generateAsync({ type: "blob" });
  return zip_content;
};

const load_settings = async () => {
  const { img } = await load_certificate_image();
  current_ctf_img.src = img.src;
};

const save_settings = async () => {
  const file = ctf_img_input.files[0];
  const base64_img = await image_to_base64(file);
  const compressed_base64 = compress_str(base64_img);
  const new_settings = { ...settings, ctf_image: compressed_base64 };
  try {
    save_data(SETTINGS_KEY, new_settings);
    settings = new_settings;
  } catch (error) {
    notify_error("حجم تصویر زیاد است!");
  }
};

const load_external_data = (json) => {
  try {
    const content = JSON.parse(json);
    confirm({
      title: "وارد کردن داده",
      msg: "آیا می خواهید داده های ورودی را به داده های موجود اضافه کنید؟",
      on_ok: () => {
        data = [...data, ...content];
        save_all_data();
        notify_success("داده ها با موفقیت اضافه شدند.");
      },
    });
  } catch (error) {
    notify_error("فایل نامعتبر است.");
  }
};

zip_btn.addEventListener("click", () => {
  if (data.length) {
    confirm({
      title: "صدور گواهی برای همه",
      msg: "آیا می خواهید برای همه گواهی صادر کنید ؟",
      on_ok: async () => {
        loader.classList.add("active");
        const zip = await zip_all_certificates();
        save_blob(` گواهی ها ${Date.now()}.zip`, zip);
        loader.classList.remove("active");
      },
    });
  } else {
    notify_error("داده ای برای ذخیره وجود ندارد");
  }
});

settings_form.addEventListener("submit", async (e) => {
  loader.classList.add("active");
  e.preventDefault();
  await save_settings();
  await load_settings();
  setTimeout(() => {
    loader.classList.remove("active");
    notify_success("تنظیمات با موفقیت ذخیره شد.");
  }, 1500);
});

export_btn.addEventListener("click", () => {
  if (data.length) save_text(`داده های خروجی ${Date.now()}.json`, data);
  else notify_error("داده ای برای خروجی وجود ندارد");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addData();
  form.reset();
});

import_input.addEventListener("change", () => {
  const file_to_read = import_input.files[0];
  read_file(file_to_read, load_external_data);
});

remove_all_btn.addEventListener("click", () => {
  if (data.length) {
    confirm({
      title: "حذف همه",
      msg: "همه داده ها حذف خواهند شد!",
      on_ok: () => {
        data = [];
        notify_success("با موفقیت حذف شد.");
        save_all_data();
      },
    });
  } else {
    notify_error("داده ای برای حذف وجود ندارد");
  }
});

(() => {
  render_data_list();
  load_settings();
})();
