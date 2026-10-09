(function () {
  "use strict";
  document.querySelectorAll("[data-template-profiles]").forEach(function (root) {
    var select = root.querySelector('select[name="industry"]');
    if (!select) return;
    var profiles;
    try { profiles = JSON.parse(root.getAttribute("data-template-profiles") || "{}"); }
    catch (error) { return; }
    function text(target, values) {
      var node = root.querySelector(target);
      if (node) node.textContent = (values || []).join(" · ") || "None";
    }
    function update() {
      var profile = profiles[select.value];
      if (!profile) return;
      var list = root.querySelector("[data-template-stages]");
      if (list) {
        list.replaceChildren();
        (profile.stages || []).forEach(function (stage) {
          var item = document.createElement("li");
          item.textContent = stage;
          list.appendChild(item);
        });
      }
      text("[data-template-services]", profile.services);
      text("[data-template-properties]", profile.properties);
      var common = profile.common_fields || {};
      var wording = root.querySelector("[data-template-wording]");
      root.querySelectorAll("[data-template-common-field]").forEach(function (field) {
        var key = field.getAttribute("data-template-common-field");
        var active = Object.prototype.hasOwnProperty.call(common, key);
        var input = field.querySelector("input");
        var label = field.querySelector("[data-template-common-label]");
        field.hidden = !active;
        field.style.display = active ? "" : "none";
        field.setAttribute("aria-hidden", active ? "false" : "true");
        if (input) {
          input.disabled = !active;
          if (active && wording && wording.checked) input.value = common[key];
          else if (active) input.value = input.getAttribute("data-template-saved-value") || common[key];
        }
        if (active && label) label.textContent = common[key];
      });
      var message = root.querySelector("[data-template-message]");
      if (message) message.textContent = profile.name + " is selected for preview. Click Apply selected template to save these changes.";
    }
    select.addEventListener("change", update);
    var wording = root.querySelector("[data-template-wording]");
    if (wording) wording.addEventListener("change", update);
    root.querySelectorAll("[data-template-common-field] input").forEach(function (input) {
      input.addEventListener("input", function () {
        if (!wording || !wording.checked) input.setAttribute("data-template-saved-value", input.value);
      });
    });
    var form = root.closest("form");
    if (form) {
      var ready = document.createElement("input");
      ready.type = "hidden";
      ready.name = "template_preview_ready";
      ready.value = "1";
      form.appendChild(ready);
    }
    update();
  });
}());
