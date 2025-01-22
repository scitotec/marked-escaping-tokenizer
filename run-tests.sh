#/usr/bin/env sh

die() {
    echo "$1"
    exit 1
}
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

for version in {4..15}; do
    printf "Running tests with marked@$version..."
    npm install --no-progress --no-save --no-package-lock --no-audit --no-bin-links --no-fund \
      "marked@$version" > /dev/null 2>&1 || die "install failed for version $version"
    output=`script -q /dev/null npm run test`
    if [ $? -ne 0 ]; then
        echo "${RED}FAILED${NC}"
        echo "$output"
        die "test failed for version $version"
    else
        echo "${GREEN}SUCCESS${NC}"
    fi
done

npm install --no-progress > /dev/null 2>&1
