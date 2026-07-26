export function downloadBlob(data, fileName, type) {

    const blob = new Blob([data], { type });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = fileName;

    a.click();

    URL.revokeObjectURL(url);
}