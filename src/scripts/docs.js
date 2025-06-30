document.querySelectorAll(".overview-title").forEach((title) => {
  title.addEventListener("click", function () {
    document
      .querySelectorAll(".overview-item")
      .forEach((item) => item.classList.remove("active"));
    this.parentElement.classList.add("active");
  });
});

document.querySelectorAll(".tab-header").forEach((header) => {
  header.addEventListener("click", function () {
    const tabIndex = this.dataset.tab;

    // Remove active from all headers and items
    document
      .querySelectorAll(".tab-header")
      .forEach((h) => h.classList.remove("active"));
    document
      .querySelectorAll(".option-item")
      .forEach((item) => item.classList.remove("active"));

    // Add active to clicked header and corresponding item
    this.classList.add("active");
    document.querySelectorAll(".option-item")[tabIndex].classList.add("active");
  });
});
