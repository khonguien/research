# HOW TO USE MiCADMicrostructure APP & CONVERSION TOOL

## 1. PRE-REQUISITES: INPUT FILE & HARDWARE
* **Input CAD File:** Your input `.stl` or `.obj` file **MUST** be a convex shape.
* **N52 Magnets (1/8" thickness, 3/8" diameter):** [eBay Link](https://www.ebay.com/itm/286748027311).
* **eFlesh Magnetometer Board:** [WowRobo Link](https://shop.wowrobo.com/products/eflesh-magnetometer-board).
* **TPU Filament:** Shore hardness 95A (e.g., Polymaker 95A TPU Blue) [1, 2].

## 2. FOLDER PLACEMENT (CRITICAL)
⚠️ **IMPORTANT:** The app uses absolute paths. You MUST extract/place the downloaded `miCADstructure` folder directly into the root of your `D:` drive.
* **Correct Windows Path:** `D:\miCADstructure`
* If you place this folder on your Desktop, Downloads, or `C:` drive, the app will fail to find the required files and crash.

## 3. OPEN UBUNTU & DIRECT TO WORKING FOLDER
Open your Ubuntu terminal and move to the working directory:
cd /mnt/d/miCADstructure/Tools

⚠️ IF ERROR WITH WSL, FOLLOW THESE STEPS:
* CHECK WSL LIST: wsl -l -v
* UNINSTALL: wsl --unregister [Ubuntu-22.04] (Replace with your Ubuntu name)
* INSTALL NEW UBUNTU: wsl --install -d Ubuntu-22.04

## 4. FIRST TIME SET-UP (INSTALL DEPENDENCIES)
Run the following commands one by one to install all required C++, Python libraries, and 3D processing tools:

* **Step 4.1: Install C++ Core Dependencies**
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y build-essential cmake libgmp-dev libmpfr-dev libcgal-dev libeigen3-dev libsuitesparse-dev libboost-all-dev

* **Step 4.2: Install Python & Libraries**
sudo apt install python3 python3-pip python3-tk -y
pip3 install papermill jupyter customtkinter igl meshio numpy scipy pandas matplotlib tqdm trimesh

* **Step 4.3: Install Blender (For Stage 2 & 3 - Standalone parts)**
sudo apt-get install blender -y

* **Step 4.4: Build the Microstructure C++ Core**
cd /mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators
chmod +x build.sh
./build.sh cpu_nodes=2

*(Note: Change the 2 in cpu_nodes=2 to the number of CPU cores you want to use for compiling)*

## 5. RUN THE APP (1-CLICK PIPELINE)
Once everything is installed and built, you can run the app. Follow these steps:

* Move back to the Tools directory:
cd /mnt/d/miCADstructure/Tools

* Open the app:
python3 app.py

In the UI, select your input CAD files, adjust parameters like Cell Size (c) and Young's Modulus (E), and click **FULL PIPELINE** or run stages individually.

## 6. SLICING & 3D PRINTING INSTRUCTIONS
Once the app outputs the final files and opens OrcaSlicer, follow these steps to fabricate:

* **Slicing Settings:** Use the TPU 95A preset. The lattice structure can be printed without supports. If you need supports for the PCB slot area, use 'Paint Supports' manually.
* **Add Pause for Magnets:** Scroll the layer slider to identify the last layer of the magnet pouch. Go one layer higher, right-click on the slider (+), and select 'Add Pause' (M0).
* **Printing:** Start the print on a printer like Bambu Lab X1C. When the printer pauses, insert the 4 neodymium magnets into the pouches (North poles facing upwards), then hit 'Resume' to seal them inside.
* **Assembly:** After printing, insert the eFlesh Magnetometer Board into the bottom slot.
* **3D view:** https://www.ilove3dm.com/viewer-3d