document.getElementById("deployForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const resultEl = document.getElementById("result");
  resultEl.textContent = "⏳ Sedang deploy ke DitzyCreateWeb...";

  try {
    const res = await fetch("/api/deploy", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      resultEl.innerHTML =
        `✅ Website berhasil dibuat: <a href="https://${data.url}" target="_blank">${data.url}</a>`;
    } else {
      resultEl.textContent = "❌ Gagal deploy.";
    }
  } catch (err) {
    resultEl.textContent = "⚠️ Error koneksi ke server DitzyCreateWeb.";
  }
});
