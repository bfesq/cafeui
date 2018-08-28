oc new-build --name cafeui --strategy=source --binary --image-stream=nodejs:latest --follow
oc start-build cafeui --from-dir=.



