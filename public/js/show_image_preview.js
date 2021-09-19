const input = $("#inputGroupFile01");
input.on("change", function () {
  const file = input.prop("files")[0];
  const fileName = file.name;

  $("#upload_label").text(fileName);

  $("#product_image").remove();

  const img = $("<img></img>");

  img.attr("src", URL.createObjectURL(file));
  img.attr("width", "10%");
  img.attr("id", "product_image");

  $("#image_upload_group").append(img);
});
