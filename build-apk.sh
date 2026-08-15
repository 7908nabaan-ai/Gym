#!/bin/bash

###############################################################################
# Cordova APK Build Script for Gym App
# Automates the entire process: build React app, setup Cordova, build APK
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_ID="com.example.gym"
APP_NAME="GymApp"
DISPLAY_NAME="Gym App"
CORDOVA_DIR="android-build"
DIST_DIR="dist"
WWW_DIR="$CORDOVA_DIR/www"

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        exit 1
    fi
}

# Pre-flight checks
print_header "Pre-flight Checks"

check_command "node"
check_command "npm"
check_command "cordova"

print_success "All required tools found"

# Step 1: Install dependencies
print_header "Step 1: Installing Node Dependencies"

if [ -d "node_modules" ]; then
    print_warning "node_modules already exists, skipping npm install"
else
    npm install
    print_success "Dependencies installed"
fi

# Step 2: Build React app
print_header "Step 2: Building React App"

if [ -d "$DIST_DIR" ]; then
    print_warning "Removing old $DIST_DIR..."
    rm -rf "$DIST_DIR"
fi

npm run build
print_success "React app built successfully"

# Step 3: Setup/Update Cordova project
print_header "Step 3: Setting up Cordova Project"

if [ -d "$CORDOVA_DIR" ]; then
    print_warning "Cordova directory already exists, updating..."
else
    print_warning "Creating new Cordova project..."
    cordova create "$CORDOVA_DIR" "$APP_ID" "$APP_NAME"
    print_success "Cordova project created"
fi

cd "$CORDOVA_DIR"

# Add Android platform if not exists
if [ ! -d "platforms/android" ]; then
    print_warning "Android platform not found, adding it..."
    cordova platform add android
    print_success "Android platform added"
else
    print_success "Android platform already present"
fi

cd ..

# Step 4: Configure Cordova
print_header "Step 4: Configuring Cordova"

cat > "$CORDOVA_DIR/config.xml" << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.example.gym" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>Gym App</name>
    <description>Bodybuilding & Nutrition Analysis</description>
    <author email="dev@example.com" href="https://example.com">Gym Developer</author>
    <content src="index.html" />
    
    <!-- Permissions -->
    <permission name="android.permission.INTERNET" />
    <permission name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Preferences -->
    <preference name="Orientation" value="portrait" />
    <preference name="fullscreen" value="false" />
    <preference name="webviewbounce" value="false" />
    
    <!-- Plugins -->
    <plugin name="cordova-plugin-whitelist" spec="1" />
    <plugin name="cordova-plugin-network-information" spec="^3.1.0" />
    
    <!-- Allow external URLs -->
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    
    <!-- Platform specific allow -->
    <allow-navigation href="http://*/*" />
    <allow-navigation href="https://*/*" />
</widget>
EOF

print_success "config.xml created"

# Step 5: Copy built files to Cordova www
print_header "Step 5: Copying Built Files to Cordova"

if [ ! -d "$WWW_DIR" ]; then
    mkdir -p "$WWW_DIR"
fi

# Clear www directory
rm -rf "$WWW_DIR"/*

# Copy dist files
cp -r "$DIST_DIR"/* "$WWW_DIR/"

print_success "Built files copied to $WWW_DIR"

# Step 6: Build APK
print_header "Step 6: Building APK"

cd "$CORDOVA_DIR"

# Check if user wants debug or release build
read -p "Build type? (debug/release) [debug]: " BUILD_TYPE
BUILD_TYPE=${BUILD_TYPE:-debug}

if [ "$BUILD_TYPE" = "release" ]; then
    print_warning "Building RELEASE APK (requires keystore)"
    cordova build android --release
    APK_PATH="platforms/android/app/build/outputs/apk/release/app-release.apk"
else
    print_warning "Building DEBUG APK..."
    cordova build android --debug
    APK_PATH="platforms/android/app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

# Step 7: Verify APK
print_header "Step 7: Verifying APK"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    print_success "APK created successfully!"
    echo -e "\n${GREEN}APK Details:${NC}"
    echo "  Path: $(pwd)/$APK_PATH"
    echo "  Size: $APK_SIZE"
else
    print_error "APK build failed or file not found"
    exit 1
fi

# Summary
print_header "Build Complete!"

echo -e "${GREEN}Your APK is ready at:${NC}"
echo "  $(pwd)/$APK_PATH"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Install on device: adb install -r $APK_PATH"
echo "  2. Or upload to Google Play Console"
echo ""
echo -e "${YELLOW}⚠ Important for your app:${NC}"
echo "  Your Express backend won't run on the device."
echo "  Update your API_URL in the React code to point to your deployed server."
echo ""

print_success "Build script completed!"
