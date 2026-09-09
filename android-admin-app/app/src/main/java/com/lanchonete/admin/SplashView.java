package com.lanchonete.tres.admin;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.view.View;

/** Splash nativa da Lanchonete 3. */
public final class SplashView extends View {
    private static final int BG = Color.rgb(247, 240, 231);
    private static final int WINE = Color.rgb(91, 24, 48);
    private static final int MINT = Color.rgb(130, 199, 170);
    private static final int GOLD = Color.rgb(216, 169, 77);
    private static final int TRACK = Color.rgb(221, 206, 195);

    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Path logoPath = new Path();
    private final RectF spinnerRect = new RectF();
    private float spinnerAngle = -90f;
    private boolean running = true;

    public SplashView(Context context) {
        super(context);
        setBackgroundColor(BG);
        setClickable(true);
        setFocusable(true);
        textPaint.setColor(WINE);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTypeface(android.graphics.Typeface.create("serif", android.graphics.Typeface.BOLD));
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        float w = getWidth();
        float h = getHeight();
        if (w <= 0 || h <= 0) return;

        drawAccents(canvas, w, h);
        float logoSize = Math.min(w * .48f, dp(220));
        drawLogo(canvas, w / 2f, h * .42f, logoSize);

        float spinnerSize = dp(46);
        float spinnerY = h * .65f;
        spinnerRect.set(w / 2f - spinnerSize / 2f, spinnerY - spinnerSize / 2f,
                w / 2f + spinnerSize / 2f, spinnerY + spinnerSize / 2f);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setStrokeWidth(dp(4));
        paint.setColor(TRACK);
        canvas.drawArc(spinnerRect, 0, 360, false, paint);
        paint.setColor(WINE);
        canvas.drawArc(spinnerRect, spinnerAngle, 108, false, paint);

        textPaint.setTextSize(sp(17));
        canvas.drawText("Preparando a casa", w / 2f, spinnerY + dp(66), textPaint);

        if (running) {
            spinnerAngle = (spinnerAngle + 5.2f) % 360f;
            postInvalidateOnAnimation();
        }
    }

    private void drawAccents(Canvas canvas, float w, float h) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(dp(1.4f));
        paint.setColor(Color.argb(90, 91, 24, 48));
        canvas.drawCircle(w * .10f, h * .14f, w * .19f, paint);
        canvas.drawCircle(w * .91f, h * .88f, w * .26f, paint);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(GOLD);
        canvas.drawCircle(w * .86f, h * .15f, dp(6), paint);
    }

    private void drawLogo(Canvas canvas, float cx, float cy, float size) {
        RectF panel = new RectF(cx - size / 2f, cy - size / 2f, cx + size / 2f, cy + size / 2f);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(WINE);
        canvas.drawRoundRect(panel, size * .08f, size * .31f, paint);

        float left = panel.left;
        float top = panel.top;
        logoPath.reset();
        logoPath.moveTo(left + size * .27f, top + size * .30f);
        logoPath.cubicTo(left + size * .42f, top + size * .18f,
                left + size * .75f, top + size * .22f,
                left + size * .76f, top + size * .40f);
        logoPath.cubicTo(left + size * .77f, top + size * .50f,
                left + size * .68f, top + size * .55f,
                left + size * .55f, top + size * .55f);
        logoPath.cubicTo(left + size * .70f, top + size * .55f,
                left + size * .79f, top + size * .64f,
                left + size * .76f, top + size * .76f);
        logoPath.cubicTo(left + size * .72f, top + size * .91f,
                left + size * .41f, top + size * .89f,
                left + size * .25f, top + size * .78f);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setStrokeJoin(Paint.Join.ROUND);
        paint.setStrokeWidth(size * .075f);
        paint.setColor(MINT);
        canvas.drawPath(logoPath, paint);

        paint.setStyle(Paint.Style.FILL);
        paint.setColor(GOLD);
        canvas.drawCircle(panel.right - size * .13f, panel.top + size * .13f, size * .035f, paint);
    }

    public void stopAnimation() { running = false; }
    private float dp(float value) { return value * getResources().getDisplayMetrics().density; }
    private float sp(float value) { return value * getResources().getDisplayMetrics().scaledDensity; }
}
