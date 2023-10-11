---
title: "{{ replace .TranslationBaseName "-" " " | title }}"
date: {{ .Date }}

draft: true
output:
  html_document:
    keep_md: yes
always_allow_html: true
---

```{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE, warning = FALSE, message = FALSE, out.width='100%')
```

