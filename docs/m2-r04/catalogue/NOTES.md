# M2-R04 catalogue image notes

Root cause: product images used `h-48 object-cover` in a fixed 192px-high box whose width varied with the viewport (314px mobile, 332px tablet, 605px desktop). object-cover scales to fill the box and crops the rest, so the hidden share of each image grew as the box got wider than the image.

Before (object-cover, 192px high): intrinsic WxH, intrinsic ratio, box ratio and % of image area hidden per viewport.

| image | intrinsic | ratio | mobile box ratio / hidden | tablet | desktop |
|---|---|---|---|---|---|
| tractor-1 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| tractor-2 | 700x700 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| tractor-3 | 700x467 | 1.499 | 1.635 / 8.3% | 1.729 / 13.3% | 3.151 / 52.4% |
| tractor-4 | 700x700 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| tractor-5 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| tractor-6 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| tractor-7 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| tractor-8 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| tractor-9 | 700x700 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| harvester-1 | 700x700 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| harvester-3 | 700x700 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| harvester-4 | 700x700 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| harvester-5 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| harvester-2 | 990x590 | 1.678 | 1.635 / 2.5% | 1.729 / 3% | 3.151 / 46.7% |
| threediskplough | 700x460 | 1.522 | 1.635 / 7% | 1.729 / 12% | 3.151 / 51.7% |
| diskharrow18 | 224x224 | 1 | 1.635 / 38.9% | 1.729 / 42.2% | 3.151 / 68.3% |
| twodiskplough | 1000x1110 | 0.901 | 1.635 / 44.9% | 1.729 / 47.9% | 3.151 / 71.4% |
| waterbowser | 1440x1079 | 1.335 | 1.635 / 18.4% | 1.729 / 22.8% | 3.151 / 57.6% |

After: aspect-[4/3] stage, object-contain, 0% hidden; images fill 81-100% of the stage on the limiting axis.

Low-resolution or tightly cropped sources (reported only, not replaced): diskharrow18.jpeg 224x224 (upscaled in the stage), threeDiskPlough.webp 700x460, tractor-3.png 700x467, 700x700 sources (tractor-2/4/9, harvester-1/3/4). twodiskplough.png is portrait 1000x1110.

Known, outside this change: the Header nav overflows the viewport by 74px at 820px width (pre-existing in the base commit).
