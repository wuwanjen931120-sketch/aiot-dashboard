/* core.js
 * 1) auth guard（未登入禁止進入）
 * 2) 全域防爆（避免白畫面）
 * 3) 資料驗證工具（避免輸入資料造成崩潰）
 */

(function(){
  // ===== Auth Guard =====
  try{
    const isLogin = localStorage.getItem("isLogin");
    if(isLogin !== "true"){
      // 不是在 login/index 頁時才導回
      const page = location.pathname.split("/").pop();
      if(page !== "login.html" && page !== "index.html" && page !== ""){
        location.replace("login.html");
      }
    }
  }catch(e){
    const page = location.pathname.split("/").pop();
    if(page !== "login.html" && page !== "index.html" && page !== ""){
      location.replace("login.html");
    }
  }

  // ===== Error UI =====
  function getErrorBar(){
    return document.getElementById("errorBar");
  }
  window.showError = function(msg){
    const el = getErrorBar();
    if(!el) return;
    el.style.display = "block";
    el.textContent = "⚠️ " + (msg || "發生未知錯誤");
    setTimeout(()=>{ if(el) el.style.display="none"; }, 10000);
  };

  // ===== Global crash prevent =====
  window.onerror = function(message, source, line, col, error){
    console.error("JS Error:", message, source, line, col, error);
    window.showError(String(message));
    return true;
  };

  window.onunhandledrejection = function(e){
    console.error("Unhandled Promise:", e.reason);
    window.showError("非同步錯誤：" + (e.reason?.message || e.reason || "unknown"));
    return true;
  };

  // ===== Safe helpers (避免輸入資料崩潰) =====
  window.safeText = function(v, def=""){
    if(v === null || v === undefined) return def;
    return String(v);
  };

  window.safeNumber = function(v, def=0){
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // 防止 JSON.parse 崩潰
  window.safeJsonParse = function(text, fallback){
    try{
      return JSON.parse(text);
    }catch(e){
      return fallback;
    }
  };

  // 防止 innerHTML 注入/格式錯造成 layout 崩壞：用 textContent
  window.setText = function(id, text){
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = window.safeText(text, "");
  };

  // 安全更新 KPI（避免 NaN、undefined）
  window.safeUpdateKPI = function({total, ng, fps}){
    const totalN = Math.max(0, window.safeNumber(total, 0));
    const ngN    = Math.max(0, window.safeNumber(ng, 0));
    const fpsN   = Math.max(10, Math.min(60, window.safeNumber(fps, 15)));

    const ok = Math.max(0, totalN - ngN);
    const yieldPct = totalN > 0 ? Math.round(ok / totalN * 100) : 0;

    window.setText("kpiTotal", totalN);
    window.setText("kpiNg", ngN);
    window.setText("kpiFps", fpsN);
    window.setText("kpiYield", yieldPct + "%");
  };

  // logout 共用
  window.logout = function(){
    try{
      localStorage.removeItem("isLogin");
      localStorage.removeItem("loginUser");
    }catch(e){}
    location.replace("login.html");
  };
})();