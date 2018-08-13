rm -rf ./build/ &&
mkdir -p ./build  &&
flow-remove-types ./src/ -d ./build/ --all --pretty &&
rm -rf ./build/types
#  &&
# eslint ./build --fix