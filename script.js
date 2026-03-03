/* script.js
 * 共用 UI 行為（Dashboard / Logs / Settings 都可以用）
 */

window.toggleDrawer = function(open){
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");
  if(!drawer || !overlay) return;

  if(open){
    drawer.classList.add("open");
    overlay.classList.add("show");
  }else{
    drawer.classList.remove("open");
    overlay.classList.remove("show");
  }
};

window.scrollToId = function(id){
  window.toggleDrawer(false);
  const el = document.getElementById(id);
  if(!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.nowTime = function(){
  const d = new Date();
  const p = (n)=> String(n).padStart(2,'0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

window.pushLog = function(state, text, note){
  const body = document.getElementById("logBody");
  if(!body) return;

  const tr = document.createElement("tr");

  let badgeClass = "ok";
  let badgeText = "OK";
  if(state === "NG"){ badgeClass = "ng"; badgeText = "NG"; }
  if(state === "WARN"){ badgeClass = "warn"; badgeText = "WARN"; }

  tr.innerHTML = `
    <td>${window.nowTime()}</td>
    <td><span class="badge ${badgeClass}">${badgeText}</span></td>
    <td>${window.safeText(text, "-")}</td>
    <td>${window.safeText(note, "")}</td>
  `;

  body.prepend(tr);
  while(body.children.length > 50) body.removeChild(body.lastChild); // logs 頁保留 50 筆
};

// demo：KPI 波動（你之後可換成 API）
window.demoRefresh = function(){
  try{
    const total = window.safeNumber(document.getElementById("kpiTotal")?.textContent, 0);
    const ng = window.safeNumber(document.getElementById("kpiNg")?.textContent, 0);
    const fps = window.safeNumber(document.getElementById("kpiFps")?.textContent, 15);

    const add = Math.floor(Math.random()*3)+1;
    const isNg = Math.random() < 0.22;

    const newTotal = total + add;
    const newNg = isNg ? (ng + 1) : ng;
    const newFps = Math.max(10, Math.min(20, fps + (Math.random()<0.5?-1:1)));

    window.safeUpdateKPI({ total:newTotal, ng:newNg, fps:newFps });
    window.pushLog(isNg ? "NG" : "OK", isNg ? "scratch_demo" : "nut_demo",
                   isNg ? "分流：瑕疵區" : "分類：良品區");
  }catch(e){
    console.error(e);
    window.showError("更新資料時發生錯誤");
  }
};

window.setMqtt = function(online){
  const dot = document.getElementById("mqttDot");
  const text = document.getElementById("mqttText");
  if(!dot || !text) return;

  if(online){
    dot.style.background = "var(--good)";
    dot.style.boxShadow = "0 0 16px rgba(34,197,94,.6)";
    text.textContent = "MQTT 已連線";
    window.pushLog("OK", "MQTT", "連線正常");
  }else{
    dot.style.background = "var(--bad)";
    dot.style.boxShadow = "0 0 16px rgba(239,68,68,.6)";
    text.textContent = "MQTT 斷線";
    window.pushLog("WARN", "MQTT", "連線中斷");
  }
};

window.demoEstop = function(){
  window.pushLog("WARN", "E-STOP", "已觸發緊急停止（展示）");
  alert("🛑 已觸發緊急停止（展示）\n\n後續可改成：發送 MQTT 指令或呼叫 API。");
};

window.demoMail = function(){
  const el = document.getElementById("mailState");
  if(el){
    el.style.color = "var(--warn)";
    el.textContent = "已送出（展示）";
    setTimeout(()=>{
      el.style.color = "var(--good)";
      el.textContent = "可用（展示）";
    }, 1200);
  }
  window.pushLog("WARN", "Gmail", "已推播通知（展示）");
};