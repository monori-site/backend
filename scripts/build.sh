echo "[Arisu] Now building service..."

java --version
rm -fr build
gradlew build

echo "[Arisu] Build should be successfully finished."
