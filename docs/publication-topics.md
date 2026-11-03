# Publication Topics And Collaboration Labels

## Topic Review

An exploratory NMF model was fitted to the 65 publication titles, not their
abstracts or full texts. TF-IDF used English stop words, Unicode accent stripping,
unigrams/bigrams, minimum document frequency 2, maximum document frequency 0.85,
and sublinear term frequency. NMF used 8 components, NNDSVDa initialization,
random seed 42, and a maximum of 1,500 iterations (scikit-learn 1.9.1).

The model identified vocabulary around gaming disorder, COVID-19, research
credibility, open science, replication, poverty/decision-making, data analysis,
and network approaches to health. Manual review turned these into nine readable
categories, separating measurement and network methods from substantive topics.
Papers can have multiple assignments. Labels are an editorial navigation aid,
not a validated taxonomy.

The authoritative, editable assignments are each paper's `topics` array in
`content/site-content.js`; category IDs and names are in `publicationTopics`.

## Collaboration Sources

PSA labels were checked against the
[official project portfolio](https://psysciacc.org/projects.html):

- PSA001: valence-dominance model of social perception (10.1038/s41562-020-01007-2).
- PSA002: object orientation (10.1007/s12144-025-08304-x).
- PSA003: gendered prejudice (10.1371/journal.pone.0323938).
- PSA006: trolley dilemma (10.1038/s41562-022-01319-5).
- PSA007: semantic priming (10.1038/s41562-025-02254-x).
- PSA-CR001: loss/gain messaging (10.1007/s42761-022-00128-3).
- PSA-CR002: cognitive reappraisal (10.1038/s41562-021-01173-x).
- PSA-CR003: social distancing (10.1073/pnas.2111091119).
- The PSA COVID-19 rapid-response dataset (10.1038/s41597-022-01811-7), explicitly
  identified as a PSA dataset in the supplied CV citation.

SCORE remains separately labelled and links to its
[official project page](https://www.cos.io/score).

## Registered Report Links

The supplied recommendation URLs were assigned to the three accepted-in-principle
papers: qualitative gaming meta-synthesis (604), gaming taxonomy (322), and open
science practices in Slovakia (778). PCI RR blocks automated page access. The ORE
[publication list](https://ore.jyu.fi/english/publications) independently links
the taxonomy to 322; the authors' [SPAO proceedings](https://www.spao.eu/files/spo-proceedings24.pdf)
link the Slovakia report to 778. The remaining supplied URL, 604, is assigned to
the qualitative meta-synthesis; its recommendation page could not be independently
read during this update.
