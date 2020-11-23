function Build-Arisu {
    echo "[Arisu] Now compiling Arisu..."

    java --version
    rm build
    gradlew build

    echo "[Arisu] E"
}
