// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "邮箱容量 " + (spec.capacity || 0) + "，每轮消费 " + (spec.quota || 0)
    + " 条，投递 " + (spec.sends || []).length + " 次。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (view.backlog || []).forEach(function (count, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "邮箱 " + (spot + 1);
      row.appendChild(head);
      const bar = document.createElement("span");
      bar.className = "bar";
      const fill = document.createElement("i");
      fill.style.width = Math.min(100, count * 20) + "%";
      bar.appendChild(fill);
      row.appendChild(bar);
      const mark = document.createElement("span");
      mark.className = "chip" + (count >= (spec.capacity || 0) ? " warn" : " ok");
      mark.textContent = count + " 条积压";
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "接受 " + view.accepted + " 条，消费 " + view.consumed + " 条，背压 "
      + view.pressed + " 次";
    parts.log.textContent = "背压位置 " + JSON.stringify(view.pressed_positions);
  }

  const actorInput = document.createElement("input");
  actorInput.type = "number";
  actorInput.value = "2";
  parts.controls.appendChild(actorInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "跑一遍";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一次投递";
  addButton.addEventListener("click", function () {
    const next = Number(actorInput.value);
    spec.sends = (spec.sends || []).concat([Number.isFinite(next) ? Math.max(1, Math.round(next)) : 1]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一次投递";
  dropButton.addEventListener("click", function () {
    spec.sends = (spec.sends || []).slice(0, Math.max(0, (spec.sends || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  const capButton = document.createElement("button");
  capButton.textContent = "容量减一";
  capButton.addEventListener("click", function () {
    spec.capacity = Math.max(1, (spec.capacity || 2) - 1);
    draw();
  });
  parts.controls.appendChild(capButton);

  draw();
}
