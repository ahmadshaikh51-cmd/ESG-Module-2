export type PptxSlide = {
  title: string;
  bulletPoints: string[];
};

export function exportToPptx(
  filename: string,
  title: string,
  slides: PptxSlide[],
) {
  let content = `TRANSVOLT MOBILITY - ESG REPORTING PRESENTATION\n`;
  content += `==============================================\n`;
  content += `Report: ${title}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n\n`;

  slides.forEach((slide, index) => {
    content += `SLIDE ${index + 1}: ${slide.title}\n`;
    content += `-`.repeat(slide.title.length + 9) + `\n`;
    slide.bulletPoints.forEach((point) => {
      content += `• ${point}\n`;
    });
    content += `\n`;
  });

  const blob = new Blob([content], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pptx") ? filename : `${filename}.pptx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
