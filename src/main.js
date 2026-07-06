import JSZip from "jszip";
import { saveAs } from "file-saver";

// MARK: Settings
let speedoType = "frame11";
let fontSize = 64;
let pad = 0;
let vtfRes = { x: 64, y: 64 };
let debug = false;

let maxNumber = 9;
let maxWidth = 0;

// MARK: input functions
function onSpeedoTypeUpdate() {
	speedoType = $speedoType.value;

	switch (speedoType) {
		case "frame11":
			maxNumber = 9;
			vtfRes = { x: 64, y: 64 };
			$vtfResX.value = 64;
			$vtfResY.value = 64;
			break;
		case "frame111":
			maxNumber = 109;
			vtfRes = { x: 256, y: 64 };
			$vtfResX.value = 256;
			$vtfResY.value = 64;
			break;
		case "frame3501":
			maxNumber = 3500;
			vtfRes = { x: 256, y: 64 };
			$vtfResX.value = 256;
			$vtfResY.value = 64;
			break;
		default:
			maxNumber = 9;
			break;
	}
}

function onFontSizeInput() {
	fontSize = $fontSizeInput.value;
}

function onPadInput() {
	pad = parseInt($padInput.value);
}

function onVtfResXInput() {
	vtfRes.x = $vtfResX.value;
}

function onVtfResYInput() {
	vtfRes.y = $vtfResY.value;
}

function updateCanvasSize(res) {
	$canvasRes.innerText = `canvas{width: ${res.x}px; height: ${res.y}px;}`;
}

function onDebugUpdate() {
	debug = $debug.checked;
}

// MARK: Onload
window.onload = () => {
	onSpeedoTypeUpdate();
	onFontSizeInput();
	onPadInput();
	onVtfResXInput();
	onVtfResYInput();
	updateCanvasSize(vtfRes);
	onDebugUpdate();
};

// MARK: Event listeners
const $canvasRes = document.createElement("style");
document.body.appendChild($canvasRes);

// inputs
const $speedoType = document.getElementById("speedo-type-select");
$speedoType.addEventListener("change", () => {
	onSpeedoTypeUpdate();
});

const $uploadFontBtn = document.getElementById("upload-font");
$uploadFontBtn.addEventListener("change", () => {
	uploadFont($uploadFontBtn);
});

const $fontSizeInput = document.getElementById("font-size-input");
$fontSizeInput.addEventListener("change", () => {
	onFontSizeInput();
});

const $padInput = document.getElementById("pad-input");
$padInput.addEventListener("change", () => {
	onPadInput();
});

const $vtfResX = document.getElementById("vtf-res-x-input");
$vtfResX.addEventListener("change", () => {
	onVtfResXInput();
});

const $vtfResY = document.getElementById("vtf-res-y-input");
$vtfResY.addEventListener("change", () => {
	onVtfResYInput();
});

const $debug = document.getElementById("debug-checkbox");
$debug.addEventListener("change", () => {
	onDebugUpdate();
});

const $previewBtn = document.getElementById("preview-btn");
$previewBtn.addEventListener("click", () => {
	updateCanvasSize(vtfRes);
	generateSpeedoFrames(vtfRes);
});

const $downloadBtn = document.getElementById("download-btn");
$downloadBtn.addEventListener("click", () => {
	updateCanvasSize(vtfRes);
	zipImages();
});

// MARK: Fonts
function uploadFont($input) {
	let reader;

	if ($input.files && $input.files[0]) {
		reader = new FileReader();
		reader.readAsDataURL($input.files[0]);
		reader.onload = () => {
			if (reader.result) {
				loadFont(reader.result);
			}
		};
	}
}

function loadFont(fontdata) {
	const fontName = "customfont";
	const font = new FontFace(fontName, `url(${fontdata})`);
	// document.fonts.clear();
	document.fonts.add(font);
	font.load().then(() => {
		const css = `.font-${fontName}{font-family: ${fontName}}`;
		const $style = document.createElement("style");
		$style.innerText = css;
		$style.setAttribute("id", "fontName");
		document.body.appendChild($style);
	});
}

// MARK: Zip
async function zipImages() {
	const zipName = `generated-speedo-digits`;

	let zip = new JSZip();

	zip.file("README.md", createReadme());

	let frames = await generateSpeedoFrames(vtfRes);

	for (let i = 0; i < frames.length; i++) {
		zip.file(`${i}.png`, frames[i]);
	}

	zip.file("max-char-width.txt", Math.round(maxWidth).toString());

	downloadZip(zip, zipName);
}

function createReadme() {
	return (
		"# mmarc Speedo Digit Generator\n\n" +
		"## Usage:\n" +
		"0. Download and install VTFEdit Reloaded (or a VTF editor of your choice) https://github.com/Sky-rym/VTFEdit-Reloaded\n" +
		"1. Extract this zip\n" +
		"2. Select all images in the zip\n" +
		"3. Drag and drop the images over VTFEdit Reloaded\n" +
		"4. Select the following settings:\n" +
		"  - Color Format: DXT5\n" +
		"  - Alpha Format: DXT5\n" +
		"  - Texture Type Format: Animated Texture\n" +
		"5. Ensure frames correctly align with digits (frame 0 displays 0, frame 1 displays 1, etc.)\n" +
		"6. Save your VTF\n"
	);
}

async function generateSpeedoFrames(res) {
	let result;

	for (let i = 0; i < 10; i++) {
		const canvas = document.createElement("canvas");
		canvas.width = res.x;
		canvas.height = res.y;
		const ctx = canvas.getContext("2d");
		ctx.font = `${fontSize}px customfont`;

		maxWidth = ctx.measureText(i.toString()).width;
	}
	maxWidth += pad;

	document.querySelectorAll("canvas").forEach((c) => c.remove());

	switch (speedoType) {
		case "frame11":
			result = await Promise.all(
				Array.from({
					length: maxNumber + 2,
				}).map((_, index) => {
					const canvas =
						document.createElement(
							"canvas",
						);
					document.body.appendChild(canvas);
					canvas.width = res.x;
					canvas.height = res.y;
					const ctx = canvas.getContext("2d");
					ctx.font = `${fontSize}px customfont`;

					if (index <= maxNumber) {
						let center = {
							x: res.x / 2,
							y: res.y * 0.85,
						};

						ctx.fillStyle = "white";
						ctx.textAlign = "center";

						if (debug) {
							ctx.fillRect(
								center.x - 1,
								0,
								2,
								res.y,
							);
							ctx.fillRect(
								center.x -
									maxWidth /
										2,
								0,
								maxWidth,
								2,
							);
							ctx.fillRect(
								center.x -
									maxWidth /
										2,
								res.y - 2,
								maxWidth,
								2,
							);
						}

						// render digits
						ctx.fillText(
							index.toString(),
							center.x,
							center.y,
						);
					}
					return convertCanvasToBlobAsync(canvas);
				}),
			);
			break;
		case "frame111":
			result = await Promise.all(
				Array.from({
					length: maxNumber + 2,
				}).map((_, index) => {
					const canvas =
						document.createElement(
							"canvas",
						);
					document.body.appendChild(canvas);
					canvas.width = res.x;
					canvas.height = res.y;
					const ctx = canvas.getContext("2d");
					ctx.font = `${fontSize}px customfont`;

					if (index <= maxNumber) {
						let units = index % 10;
						let tens = Math.floor(
							index / 10,
						);

						let center = {
							x: res.x / 2,
							y: res.y * 0.85,
						};
						let alignment = maxWidth / 2;

						ctx.fillStyle = "white";
						ctx.textAlign = "center";

						if (debug) {
							ctx.fillRect(
								center.x - 1,
								0,
								2,
								res.y,
							);
							ctx.fillRect(
								center.x -
									maxWidth,
								0,
								maxWidth,
								2,
							);
							ctx.fillRect(
								center.x -
									maxWidth,
								res.y - 2,
								maxWidth,
								2,
							);
						}

						// render tens
						ctx.fillText(
							index >= 100
								? "0"
								: tens
									? tens.toString()
									: "",
							center.x - alignment,
							center.y,
						);

						// render units
						ctx.fillText(
							units.toString(),
							center.x + alignment,
							center.y,
						);
					}
					return convertCanvasToBlobAsync(canvas);
				}),
			);
			break;
		case "frame3501":
			let center = {
				x: res.x / 2,
				y: res.y * 0.85,
			};
			let digitPos = {
				// even num of digits
				e1: center.x - maxWidth * 1.5,
				e2: center.x - maxWidth * 0.5,
				e3: center.x + maxWidth * 0.5,
				e4: center.x + maxWidth * 1.5,
				// odd num of digits
				o1: center.x - maxWidth,
				o2: center.x,
				o3: center.x + maxWidth,
			};

			result = await Promise.all(
				Array.from({
					length: maxNumber + 1,
				}).map((_, index) => {
					const canvas =
						document.createElement(
							"canvas",
						);
					document.body.appendChild(canvas);
					canvas.width = res.x;
					canvas.height = res.y;
					const ctx = canvas.getContext("2d");
					ctx.font = `${fontSize}px customfont`;

					if (index <= maxNumber) {
						let numDigits =
							index < 10
								? 1
								: index < 100
									? 2
									: index <
										  1000
										? 3
										: index <
											  10000
											? 4
											: 0;

						let digits = [
							index % 10,
							Math.floor(index / 10) %
								10,
							Math.floor(
								index / 100,
							) % 10,
							Math.floor(
								index / 1000,
							) % 10,
						]; // digits in reverse order

						ctx.fillStyle = "white";
						ctx.textAlign = "center";

						switch (numDigits) {
							case 1:
								ctx.fillText(
									digits[0].toString(),
									digitPos.o2,
									center.y,
								);
								break;
							case 2:
								ctx.fillText(
									digits[1].toString(),
									digitPos.e2,
									center.y,
								);
								ctx.fillText(
									digits[0].toString(),
									digitPos.e3,
									center.y,
								);
								break;
							case 3:
								ctx.fillText(
									digits[2].toString(),
									digitPos.o1,
									center.y,
								);
								ctx.fillText(
									digits[1].toString(),
									digitPos.o2,
									center.y,
								);
								ctx.fillText(
									digits[0].toString(),
									digitPos.o3,
									center.y,
								);
								break;
							case 4:
								ctx.fillText(
									digits[3].toString(),
									digitPos.e1,
									center.y,
								);
								ctx.fillText(
									digits[2].toString(),
									digitPos.e2,
									center.y,
								);
								ctx.fillText(
									digits[1].toString(),
									digitPos.e3,
									center.y,
								);
								ctx.fillText(
									digits[0].toString(),
									digitPos.e4,
									center.y,
								);
								break;
							default:
								break;
						}

						if (debug) {
							let alignment;
							if (numDigits % 2) {
								alignment =
									digitPos.o2 -
									maxWidth /
										2;
							} else {
								alignment =
									digitPos.e2 -
									maxWidth /
										2;
							}
							ctx.fillRect(
								alignment +
									maxWidth,
								0,
								2,
								res.y,
							);
							ctx.fillRect(
								alignment,
								0,
								maxWidth,
								2,
							);
							ctx.fillRect(
								alignment,
								res.y - 2,
								maxWidth,
								2,
							);
						}
					}
					return convertCanvasToBlobAsync(canvas);
				}),
			);
			break;
		default:
			break;
	}
	return result;
}

async function downloadZip(zip, name) {
	zip.generateAsync({ type: "blob" }).then((content) => {
		saveAs(content, `${name}.zip`);
	});
}

async function convertCanvasToBlobAsync(canvas) {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob.arrayBuffer()));
	});
}
