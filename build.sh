
#!/bin/bash - Denotes that this is an executable bash file

# Removes the /dist directory if it exists (cleanup).
# Creates a new /dist directory.
rm -rf dist && mkdir dist

# Compiles every file to ES5 and moves the files to the /dist directory, with the exception of node_modules (those are already compiled).
npx babel src --out-dir dist --ignore node_modules

# By design, npx doesn’t migrate json files, so we need to copy it ourselves using the cp command.
cp src/package.json dist

# Move into the /dist directory and install the npm modules using yarn
cd dist && yarn install —production —modules–folder node_modules

# To run the build, do $ ./build.sh