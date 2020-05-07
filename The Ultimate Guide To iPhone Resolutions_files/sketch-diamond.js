var Diamond = {};

(function()
{

	function makePoint(x, y)
	{
		return { x: x, y: y };
	}

	function makeRect(x, y, w, h)
	{
		return { x: x, y: y, w: w, h: h };
	}

	function initializeCanvas(canvasId)
	{
		// This function should only be called once on each canvas.
		// It will ensure the best rendering quality on both Retina and non-Retina displays.
		var canvas = document.getElementById(canvasId);
		var context = canvas.getContext('2d');

		var devicePixelRatio = window.devicePixelRatio || 1;
		var backingStorePixelRatio = context.webkitBackingStorePixelRatio
			|| context.mozBackingStorePixelRatio
			|| context.msBackingStorePixelRatio
			|| context.oBackingStorePixelRatio
			|| context.backingStorePixelRatio
			|| 1;

		var pixelRatio = devicePixelRatio / backingStorePixelRatio;

		canvas.style.width = canvas.width + 'px';
		canvas.style.height = canvas.height + 'px';
		canvas.width *= pixelRatio;
		canvas.height *= pixelRatio;
		canvas.webcodePixelRatio = pixelRatio;

//		context.scale(pixelRatio, pixelRatio);
	}

	function drawDiamond(canvasId, rotation, strokeWidth, miniStrokeWidth)
	{
		//// General Declarations
		var canvas = document.getElementById(canvasId);
		var context = canvas.getContext('2d');
		var pixelRatio = canvas.webcodePixelRatio;

		context.clearRect(0, 0, canvas.width, canvas.height);
 
		//// Symbol Drawing
		var symbolRect = makeRect(0, 0, canvas.width, canvas.height);
		context.save();

		context.translate(symbolRect.x, symbolRect.y);
		context.scale(symbolRect.w / 241, symbolRect.h / 234);
	
		drawDiamondBig(canvasId, rotation, strokeWidth, miniStrokeWidth);

		context.restore();
	}

	function drawDiamondBig(canvasId, rotation, strokeWidth, miniStrokeWidth)
	{
		//// General Declarations
		var canvas = document.getElementById(canvasId);
		var context = canvas.getContext('2d');
		var pixelRatio = canvas.webcodePixelRatio;

		//// Color Declarations
		var outlineColor = 'rgba(255, 255, 255, 1)';
		var color1 = outlineColor;
		var color2 = outlineColor;
		var color3 = outlineColor;
		var color4 = outlineColor;
		var color5 = outlineColor;
		var color6 = outlineColor;

		//// Variable Declarations
		var up1 = makePoint(Math.cos(rotation * Math.PI/180) * 71, Math.sin(rotation * Math.PI/180) * 71 * 0.25);
		var up2 = makePoint(Math.cos((rotation - 60) * Math.PI/180) * 71, Math.sin((rotation - 60) * Math.PI/180) * 71 * 0.25);
		var up3 = makePoint(Math.cos((rotation - 120) * Math.PI/180) * 71, Math.sin((rotation - 120) * Math.PI/180) * 71 * 0.25);
		var up4 = makePoint(Math.cos((rotation - 180) * Math.PI/180) * 71, Math.sin((rotation - 180) * Math.PI/180) * 71 * 0.25);
		var up5 = makePoint(Math.cos((rotation - 240) * Math.PI/180) * 71, Math.sin((rotation - 240) * Math.PI/180) * 71 * 0.25);
		var up6 = makePoint(Math.cos((rotation - 300) * Math.PI/180) * 71, Math.sin((rotation - 300) * Math.PI/180) * 71 * 0.25);
		var down1 = makePoint(Math.cos(rotation * Math.PI/180) * 100, Math.sin(rotation * Math.PI/180) * 100 * 0.4 + 33);
		var down2 = makePoint(Math.cos((rotation - 60) * Math.PI/180) * 100, Math.sin((rotation - 60) * Math.PI/180) * 100 * 0.4 + 33);
		var down3 = makePoint(Math.cos((rotation - 120) * Math.PI/180) * 100, Math.sin((rotation - 120) * Math.PI/180) * 100 * 0.4 + 33);
		var down4 = makePoint(Math.cos((rotation - 180) * Math.PI/180) * 100, Math.sin((rotation - 180) * Math.PI/180) * 100 * 0.4 + 33);
		var down5 = makePoint(Math.cos((rotation - 240) * Math.PI/180) * 100, Math.sin((rotation - 240) * Math.PI/180) * 100 * 0.4 + 33);
		var down6 = makePoint(Math.cos((rotation - 300) * Math.PI/180) * 100, Math.sin((rotation - 300) * Math.PI/180) * 100 * 0.4 + 33);
		var cyclicRotation = (rotation + 3600) % 360;
		var isVisibleDown1 = !(285 > cyclicRotation && cyclicRotation > 135);
		var isVisibleDown2 = !(285 > (cyclicRotation + 60) % 360 && (cyclicRotation + 60) % 360 > 135);
		var isVisibleDown3 = !(285 > (cyclicRotation + 120) % 360 && (cyclicRotation + 120) % 360 > 135);
		var isVisibleDown4 = !(285 > (cyclicRotation + 180) % 360 && (cyclicRotation + 180) % 360 > 135);
		var isVisibleDown5 = !(285 > (cyclicRotation + 240) % 360 && (cyclicRotation + 240) % 360 > 135);
		var isVisibleDown6 = !(285 > (cyclicRotation + 300) % 360 && (cyclicRotation + 300) % 360 > 135);
		var isVisibleMiddle1 = !(312 > cyclicRotation && cyclicRotation > 165);
		var isVisibleMiddle2 = !(312 > (cyclicRotation + 60) % 360 && (cyclicRotation + 60) % 360 > 165);
		var isVisibleMiddle3 = !(312 > (cyclicRotation + 120) % 360 && (cyclicRotation + 120) % 360 > 165);
		var isVisibleMiddle4 = !(312 > (cyclicRotation + 180) % 360 && (cyclicRotation + 180) % 360 > 165);
		var isVisibleMiddle5 = !(312 > (cyclicRotation + 240) % 360 && (cyclicRotation + 240) % 360 > 165);
		var isVisibleMiddle6 = !(312 > (cyclicRotation + 300) % 360 && (cyclicRotation + 300) % 360 > 165);
		var isVisibleUp1 = !(254 > cyclicRotation && cyclicRotation > 166);
		var isVisibleUp2 = !(254 > (cyclicRotation + 60) % 360 && (cyclicRotation + 60) % 360 > 166);
		var isVisibleUp3 = !(254 > (cyclicRotation + 120) % 360 && (cyclicRotation + 120) % 360 > 166);
		var isVisibleUp4 = !(254 > (cyclicRotation + 180) % 360 && (cyclicRotation + 180) % 360 > 166);
		var isVisibleUp5 = !(254 > (cyclicRotation + 240) % 360 && (cyclicRotation + 240) % 360 > 166);
		var isVisibleUp6 = !(254 > (cyclicRotation + 300) % 360 && (cyclicRotation + 300) % 360 > 166);
		var tip = makePoint(0, 165);
		var strokeDown1 = isVisibleDown1 ? strokeWidth : miniStrokeWidth;
		var strokeDown2 = isVisibleDown2 ? strokeWidth : miniStrokeWidth;
		var strokeDown3 = isVisibleDown3 ? strokeWidth : miniStrokeWidth;
		var strokeDown4 = isVisibleDown4 ? strokeWidth : miniStrokeWidth;
		var strokeDown5 = isVisibleDown5 ? strokeWidth : miniStrokeWidth;
		var strokeDown6 = isVisibleDown6 ? strokeWidth : miniStrokeWidth;
		var strokeMiddle1 = isVisibleMiddle1 ? strokeWidth : miniStrokeWidth;
		var strokeMiddle2 = isVisibleMiddle2 ? strokeWidth : miniStrokeWidth;
		var strokeMiddle3 = isVisibleMiddle3 ? strokeWidth : miniStrokeWidth;
		var strokeMiddle4 = isVisibleMiddle4 ? strokeWidth : miniStrokeWidth;
		var strokeMiddle5 = isVisibleMiddle5 ? strokeWidth : miniStrokeWidth;
		var strokeMiddle6 = isVisibleMiddle6 ? strokeWidth : miniStrokeWidth;
		var strokeUp1 = isVisibleUp1 ? strokeWidth : miniStrokeWidth;
		var strokeUp2 = isVisibleUp2 ? strokeWidth : miniStrokeWidth;
		var strokeUp3 = isVisibleUp3 ? strokeWidth : miniStrokeWidth;
		var strokeUp4 = isVisibleUp4 ? strokeWidth : miniStrokeWidth;
		var strokeUp5 = isVisibleUp5 ? strokeWidth : miniStrokeWidth;
		var strokeUp6 = isVisibleUp6 ? strokeWidth : miniStrokeWidth;

		//// Bezier 12 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(tip.x, tip.y);
		context.lineTo(down1.x, down1.y);
		context.lineCap = 'round';
		context.strokeStyle = color1;
		context.lineWidth = strokeDown6;
		context.stroke();

		context.restore();


		//// Bezier 10 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(tip.x, tip.y);
		context.lineTo(down6.x, down6.y);
		context.lineCap = 'round';
		context.strokeStyle = color6;
		context.lineWidth = strokeDown1;
		context.stroke();

		context.restore();


		//// Bezier 11 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(tip.x, tip.y);
		context.lineTo(down2.x, down2.y);
		context.lineCap = 'round';
		context.strokeStyle = color2;
		context.lineWidth = strokeDown5;
		context.stroke();

		context.restore();


		//// Bezier 8 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(tip.x, tip.y);
		context.lineTo(down4.x, down4.y);
		context.lineCap = 'round';
		context.strokeStyle = color4;
		context.lineWidth = strokeDown3;
		context.stroke();

		context.restore();


		//// Bezier 7 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(tip.x, tip.y);
		context.lineTo(down3.x, down3.y);
		context.lineCap = 'round';
		context.strokeStyle = color3;
		context.lineWidth = strokeDown4;
		context.stroke();

		context.restore();


		//// Bezier 17 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(down3.x, down3.y);
		context.lineTo(down2.x, down2.y);
		context.lineCap = 'round';
		context.strokeStyle = color2;
		context.lineWidth = strokeMiddle5;
		context.stroke();

		context.restore();


		//// Bezier 9 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(tip.x, tip.y);
		context.lineTo(down5.x, down5.y);
		context.lineCap = 'round';
		context.strokeStyle = color5;
		context.lineWidth = strokeDown2;
		context.stroke();

		context.restore();


		//// Bezier 18 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(down4.x, down4.y);
		context.lineTo(down3.x, down3.y);
		context.lineCap = 'round';
		context.strokeStyle = color3;
		context.lineWidth = strokeMiddle4;
		context.stroke();

		context.restore();


		//// Bezier 14 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(down6.x, down6.y);
		context.lineTo(down5.x, down5.y);
		context.lineCap = 'round';
		context.strokeStyle = color5;
		context.lineWidth = strokeMiddle2;
		context.stroke();

		context.restore();


		//// Bezier 19 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(down5.x, down5.y);
		context.lineTo(down4.x, down4.y);
		context.lineCap = 'round';
		context.strokeStyle = color4;
		context.lineWidth = strokeMiddle3;
		context.stroke();

		context.restore();


		//// Bezier 16 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(down2.x, down2.y);
		context.lineTo(down1.x, down1.y);
		context.lineCap = 'round';
		context.strokeStyle = color1;
		context.lineWidth = strokeMiddle6;
		context.stroke();

		context.restore();


		//// Bezier 15 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(down1.x, down1.y);
		context.lineTo(down6.x, down6.y);
		context.lineCap = 'round';
		context.strokeStyle = color6;
		context.lineWidth = strokeMiddle1;
		context.stroke();

		context.restore();


		//// Bezier Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(up1.x, up1.y);
		context.lineTo(down1.x, down1.y);
		context.lineCap = 'round';
		context.strokeStyle = color1;
		context.lineWidth = strokeUp6;
		context.stroke();

		context.restore();


		//// Bezier 2 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(up2.x, up2.y);
		context.lineTo(down2.x, down2.y);
		context.lineCap = 'round';
		context.strokeStyle = color2;
		context.lineWidth = strokeUp5;
		context.stroke();

		context.restore();


		//// Bezier 3 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(up3.x, up3.y);
		context.lineTo(down3.x, down3.y);
		context.lineCap = 'round';
		context.strokeStyle = color3;
		context.lineWidth = strokeUp4;
		context.stroke();

		context.restore();


		//// Bezier 4 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(up4.x, up4.y);
		context.lineTo(down4.x, down4.y);
		context.lineCap = 'round';
		context.strokeStyle = color4;
		context.lineWidth = strokeUp3;
		context.stroke();

		context.restore();


		//// Bezier 5 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(up5.x, up5.y);
		context.lineTo(down5.x, down5.y);
		context.lineCap = 'round';
		context.strokeStyle = color5;
		context.lineWidth = strokeUp2;
		context.stroke();

		context.restore();


		//// Bezier 6 Drawing
		context.save();
		context.translate(122.12, 40.8);

		context.beginPath();
		context.moveTo(up6.x, up6.y);
		context.lineTo(down6.x, down6.y);
		context.lineCap = 'round';
		context.strokeStyle = color6;
		context.lineWidth = strokeUp1;
		context.stroke();

		context.restore();


		//// Bezier 13 Drawing
		context.save();
		context.translate(122.28, 40.92);

		context.beginPath();
		context.moveTo(up1.x, up1.y);
		context.lineTo(up2.x, up2.y);
		context.lineTo(up3.x, up3.y);
		context.lineTo(up4.x, up4.y);
		context.lineTo(up5.x, up5.y);
		context.lineTo(up6.x, up6.y);
		context.lineTo(up1.x, up1.y);
		context.closePath();
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.strokeStyle = outlineColor;
		context.lineWidth = strokeWidth;
		context.stroke();

		context.restore();
	}
	
	function easeInEaseOut(parameter)
	{
		return parameter < 0.5 
			? parameter = 2 * parameter * parameter
			: parameter = 1 - 2 * (parameter-1) * (parameter-1);
	}

	function mirrorEasing(parameter, easing)
	{
		return parameter < 0.5 ? easing(parameter*2) : easing(2 - 2*parameter);
	}

	function animate(canvasId, frontWidth, backWidth)
	{
		var diamondPhase = 0;
		function redrawDiamond()
		{
			var refreshRate = 1 / 60;
			diamondPhase += refreshRate / 4;
			diamondPhase %= 1;

			var easedPhase = mirrorEasing(diamondPhase, easeInEaseOut);

			var angle = easedPhase * 720;
			drawDiamond(canvasId, angle, frontWidth, backWidth);
			setTimeout(redrawDiamond, 1000 * refreshRate);
		}
	
		initializeCanvas(canvasId);
		redrawDiamond();
	}

	Diamond.animate = animate;
})();