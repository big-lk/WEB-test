// 六种预防性线索的图形（线条图，白青色，静止）。只表示「因为什么」，不含文字。
// drawGlyph(ctx, 类型, 中心 x, 中心 y, 半高 s, 颜色)：图形画在约 [-1.5s, 1.5s] × [-s, s] 的范围内。
// 这个文件不依赖其他模块，问卷页的「线索图形理解」题也可以直接用。

function car(c, x, y, w, h) {               // 侧视的车：车身 + 车顶 + 两个轮子
  c.beginPath(); c.roundRect(x - w / 2, y - h * 0.15, w, h * 0.5, h * 0.12); c.stroke();
  c.beginPath(); c.moveTo(x - w * 0.3, y - h * 0.15); c.lineTo(x - w * 0.18, y - h * 0.55); c.lineTo(x + w * 0.22, y - h * 0.55); c.lineTo(x + w * 0.36, y - h * 0.15); c.stroke();
  for (const dx of [-0.28, 0.28]) { c.beginPath(); c.arc(x + w * dx, y + h * 0.38, h * 0.16, 0, Math.PI * 2); c.stroke(); }
}
function person(c, x, y, h, dashed) {       // 小人：头 + 身体 + 腿
  if (dashed) c.setLineDash([h * 0.12, h * 0.1]);
  c.beginPath(); c.arc(x, y - h * 0.38, h * 0.13, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(x, y - h * 0.24); c.lineTo(x, y + h * 0.12); c.moveTo(x, y + h * 0.12); c.lineTo(x - h * 0.16, y + h * 0.5);
  c.moveTo(x, y + h * 0.12); c.lineTo(x + h * 0.16, y + h * 0.5); c.moveTo(x - h * 0.2, y - h * 0.08); c.lineTo(x + h * 0.2, y - h * 0.08); c.stroke();
  c.setLineDash([]);
}

const DRAW = {
  parked_front(c, x, y, s) {                // 停着的车 + 车头前虚线小人
    car(c, x - s * 0.45, y + s * 0.1, s * 1.7, s * 1.25);
    person(c, x + s * 0.95, y + s * 0.05, s * 1.3, true);
  },
  bus_stop(c, x, y, s) {                    // 站牌 + 候车亭
    c.beginPath(); c.arc(x - s * 0.85, y - s * 0.45, s * 0.3, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.85, y - s * 0.15); c.lineTo(x - s * 0.85, y + s * 0.75); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.3, y - s * 0.5); c.lineTo(x + s * 1.2, y - s * 0.5); c.moveTo(x - s * 0.1, y - s * 0.5); c.lineTo(x - s * 0.1, y + s * 0.75);
    c.moveTo(x + s * 1.0, y - s * 0.5); c.lineTo(x + s * 1.0, y + s * 0.75); c.moveTo(x + s * 0.1, y + s * 0.3); c.lineTo(x + s * 0.8, y + s * 0.3); c.stroke();
  },
  blind_junction(c, x, y, s) {              // 俯视的丁字路口，拐角是实心遮挡
    c.beginPath(); c.moveTo(x - s * 0.9, y + s * 0.8); c.lineTo(x - s * 0.9, y - s * 0.8); c.moveTo(x - s * 0.1, y + s * 0.8); c.lineTo(x - s * 0.1, y + s * 0.25);
    c.lineTo(x + s * 1.2, y + s * 0.25); c.moveTo(x - s * 0.1, y - s * 0.8); c.lineTo(x - s * 0.1, y - s * 0.3); c.lineTo(x + s * 1.2, y - s * 0.3); c.stroke();
    c.fillRect(x + s * 0.02, y + s * 0.33, s * 0.75, s * 0.45);
  },
  door_zone(c, x, y, s) {                   // 俯视的车 + 打开的车门
    c.beginPath(); c.roundRect(x - s * 0.15, y - s * 0.8, s * 0.8, s * 1.6, s * 0.2); c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.15, y - s * 0.25); c.lineTo(x - s * 0.85, y + s * 0.1); c.stroke();
    c.beginPath(); c.setLineDash([s * 0.12, s * 0.1]); c.arc(x - s * 0.15, y - s * 0.25, s * 0.78, Math.PI * 0.5, Math.PI * 0.85); c.stroke(); c.setLineDash([]);
  },
  cyclist(c, x, y, s) {                     // 自行车 + 骑车的人
    for (const dx of [-0.75, 0.75]) { c.beginPath(); c.arc(x + s * dx, y + s * 0.4, s * 0.38, 0, Math.PI * 2); c.stroke(); }
    c.beginPath(); c.moveTo(x - s * 0.75, y + s * 0.4); c.lineTo(x - s * 0.15, y - s * 0.15); c.lineTo(x + s * 0.5, y - s * 0.15); c.lineTo(x + s * 0.75, y + s * 0.4);
    c.moveTo(x - s * 0.15, y - s * 0.15); c.lineTo(x + s * 0.1, y + s * 0.4); c.stroke();
    c.beginPath(); c.arc(x + s * 0.05, y - s * 0.7, s * 0.16, 0, Math.PI * 2); c.stroke();
  },
  lead_brake(c, x, y, s) {                  // 前后两辆车，前面那辆有刹车线
    car(c, x - s * 0.8, y + s * 0.1, s * 1.2, s * 1.0);
    car(c, x + s * 0.75, y + s * 0.1, s * 1.2, s * 1.0);
    c.beginPath(); for (const dy of [-0.15, 0.1, 0.35]) { c.moveTo(x - s * 0.02, y + s * dy); c.lineTo(x + s * 0.12, y + s * dy); } c.stroke();
  },
};

export function drawGlyph(c, type, x, y, s, col) {
  c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(2.5, s * 0.11); c.lineCap = 'round'; c.lineJoin = 'round';
  (DRAW[type] || (() => {}))(c, x, y, s); c.restore();
}
export function drawCheck(c, x, y, s, col) { // 对勾：人先看到了
  c.save(); c.strokeStyle = col; c.lineWidth = Math.max(3, s * 0.2); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x - s * 0.7, y + s * 0.05); c.lineTo(x - s * 0.15, y + s * 0.55); c.lineTo(x + s * 0.8, y - s * 0.55); c.stroke(); c.restore();
}
export function drawBadge(c, x, y, w, h, col) { // 描边中空的胶囊底
  const r = h / 2; c.save(); c.beginPath();
  c.moveTo(x - w / 2 + r, y - r); c.lineTo(x + w / 2 - r, y - r); c.arc(x + w / 2 - r, y, r, -Math.PI / 2, Math.PI / 2);
  c.lineTo(x - w / 2 + r, y + r); c.arc(x - w / 2 + r, y, r, Math.PI / 2, Math.PI * 1.5); c.closePath();
  c.fillStyle = 'rgba(14,24,28,0.55)'; c.fill(); c.strokeStyle = col; c.lineWidth = Math.max(2.5, h * 0.05); c.stroke(); c.restore();
}
