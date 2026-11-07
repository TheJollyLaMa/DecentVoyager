const { VIEW } = require('./projection');
const { pixelText } = require('./font');

function drawBossLasers(ctx, game, project) {
    const boss = (game.asteroids || []).find(rock => rock.boss && rock.hp > 0);
    if (!boss || !boss.laserLanes.length) return;
    ctx.save();
    ctx.strokeStyle = boss.laserActive ? '#ff7ae6' : '#ffe65c';
    ctx.globalAlpha = boss.laserActive ? 0.8 : 0.55;
    if (!boss.laserActive) ctx.setLineDash([8, 10]);
    for (const x of boss.laserLanes) {
        const start = project({ x, y: boss.y });
        const end = project({ x, y: game.scrollY - 80 });
        if (!start || !end) continue;
        ctx.lineWidth = boss.laserActive ? Math.min(60, boss.laserWidth * (start.scale || 1)) : 2;
        if (boss.laserActive) {
            const corners = [
                project({ x: x - boss.laserWidth / 2, y: boss.y }),
                project({ x: x + boss.laserWidth / 2, y: boss.y }),
                project({ x: x + boss.laserWidth / 2, y: game.scrollY - 80 }),
                project({ x: x - boss.laserWidth / 2, y: game.scrollY - 80 })
            ];
            if (corners.every(Boolean)) {
                ctx.fillStyle = '#ff7ae666'; ctx.beginPath();
                ctx.moveTo(corners[0].x, corners[0].y);
                for (const corner of corners.slice(1)) ctx.lineTo(corner.x, corner.y);
                ctx.closePath(); ctx.fill();
            }
        }
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
        if (boss.laserActive) {
            ctx.strokeStyle = '#fff0ff'; ctx.lineWidth = 3; ctx.stroke();
            ctx.strokeStyle = '#ff7ae6';
        }
    }
    ctx.restore();
}

function drawBossStatus(ctx, game) {
    const boss = (game.asteroids || []).find(rock => rock.boss && rock.hp > 0);
    if (!boss) return;
    const width = Math.min(380, VIEW.width - 300), x = (VIEW.width - width) / 2, y = 58;
    ctx.save();
    ctx.fillStyle = '#080d20e6'; ctx.fillRect(x - 12, y - 22, width + 24, 60);
    pixelText(ctx, boss.name.toUpperCase(), VIEW.width / 2, y, { size: 13, align: 'center', color: '#ffb8ee' });
    ctx.fillStyle = '#ffffff22'; ctx.fillRect(x, y + 8, width, 8);
    ctx.fillStyle = '#ff7ae6'; ctx.fillRect(x, y + 8, width * Math.max(0, boss.hp / boss.maxHp), 8);
    pixelText(ctx, boss.laserActive ? 'LASER LIVE - EVADE' : boss.laserLanes.length ? 'LASER LOCK - MOVE OUT OF GOLD LANES' : 'DESTROY THE CORE TO OPEN THE GATE', VIEW.width / 2, y + 30, { size: 10, align: 'center', color: '#ffe65c' });
    ctx.restore();
}

module.exports = { drawBossLasers, drawBossStatus };
