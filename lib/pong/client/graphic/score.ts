import { GSettings } from "../../common/constants";

/**
 * The renderer for the score of both players
 * Used in Renderer
 */
export class ScorePanels {
  score: [number, number] = [0, 0];

  goalAgainst(playerId: number) {
    const otherPlayerId = playerId == 0 ? 1 : 0;
    this.score[otherPlayerId]++;
  }

  draw(context: CanvasRenderingContext2D, x2: number, y: number, size: number) {
    let x1 = context.canvas.width - x2;
    drawNumber(context, this.score[0], x1, y, size);
    drawNumber(context, this.score[1], x2, y, size);
  }
}

/**
 * Draw a single number on the canvas
 */

function drawNumber(
  context: CanvasRenderingContext2D,
  value: number,
  x: number,
  y: number,
  size: number
) {
  context.textBaseline = "top";
  context.fillStyle = GSettings.SCORE_PANEL_TEXT_FILLSTYLE;
  context.font = GSettings.SCORE_PANEL_FONT;

  const height = GSettings.SCORE_PANEL_FONT_SIZE;
  const width = context.measureText(value.toString()).width;
  const ratio = width / height;
  const ratioSize = size / GSettings.SCORE_PANEL_FONT_SIZE;

  context.save();
  context.translate(x - (ratio * size) / 2, y - size);
  context.scale(ratioSize, ratioSize);
  context.fillText(value.toString(), 0, 0);
  context.restore();
}
