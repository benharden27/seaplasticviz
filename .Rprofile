# load the more general .Rprofile
if (file.exists("~/.Rprofile")) {
  base::sys.source("~/.Rprofile", envir = environment())
}

# Add some general options
options(
  blogdown.author = "Ben Harden",
  blogdown.ext = ".Rmd",
  blogdown.subdir = "blog",
  blogdown.yaml.empty = TRUE,
  blogdown.new_bundle = TRUE,
  blogdown.title_case = TRUE,
  blogdown.knit.serve_site = FALSE,
  # to automatically serve the site on RStudio startup, set this option to TRUE
  blogdown.serve_site.startup = FALSE,
  # to disable knitting Rmd files on save, set this option to FALSE
  blogdown.knit.on_save = TRUE
)
