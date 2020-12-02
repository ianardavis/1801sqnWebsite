function configure_tree () {
  var toggler = document.querySelectorAll(".caret");
  // var i;
  for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
      this.parentElement.querySelector(".nested").classList.toggle("ul_active");
      this.classList.toggle("caret-down");
    });
  };
};