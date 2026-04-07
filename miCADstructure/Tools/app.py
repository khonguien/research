import customtkinter as ctk
from tkinter import filedialog, messagebox
import os
import threading
import subprocess
import papermill as pm
import time
from datetime import datetime

# UI Configuration
ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

class CAD2eFleshApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("CAD2Lattice")
        
        # Auto-sizes to the content
        # self.geometry("750x950") 
        
        # Lock the window size after it auto-fits
        self.resizable(False, False)

        self.start_time_total = 0
        self.start_time_stage = 0
        self.is_running = False
        
        self.filepath_s1 = None
        self.filepath_s2 = None
        self.filepaths_s4 = []
        self._build_ui()

    def _build_ui(self):
        self.title_label = ctk.CTkLabel(self, text="CAD2Lattice", font=ctk.CTkFont(size=24, weight="bold"))
        self.title_label.pack(pady=(10, 5))

        # TIMER
        self.stats_frame = ctk.CTkFrame(self, fg_color="#979696")
        self.stats_frame.pack(pady=5, padx=20, fill="x")
        self.lbl_total_timer = ctk.CTkLabel(self.stats_frame, text="Total Elapsed: 00:00", font=ctk.CTkFont(family="Consolas", size=14))
        self.lbl_total_timer.pack(side="left", padx=20, pady=10)
        self.lbl_stage_timer = ctk.CTkLabel(self.stats_frame, text="Stage Timer: 00:00", font=ctk.CTkFont(family="Consolas", size=14), text_color="#ff0000")
        self.lbl_stage_timer.pack(side="right", padx=20, pady=10)

        # INPUT
        self.input_frame = ctk.CTkFrame(self)
        self.input_frame.pack(pady=5, padx=20, fill="x")
        ctk.CTkLabel(self.input_frame, text="Input Files", font=ctk.CTkFont(weight="bold")).pack(pady=(5, 0))

        self.frame_upload_1 = ctk.CTkFrame(self.input_frame, fg_color="transparent")
        self.frame_upload_1.pack(fill="x", pady=2)
        self.lbl_file_1 = ctk.CTkLabel(self.frame_upload_1, text="Base CAD (.stl)")
        self.lbl_file_1.pack(side="left", padx=15)
        self.btn_upload_1 = ctk.CTkButton(self.frame_upload_1, text="Upload S1", width=100, command=lambda: self.upload_file(1))
        self.btn_upload_1.pack(side="right", padx=15)

        self.frame_upload_2 = ctk.CTkFrame(self.input_frame, fg_color="transparent")
        self.frame_upload_2.pack(fill="x", pady=2)
        self.lbl_file_2 = ctk.CTkLabel(self.frame_upload_2, text="Microstructure (.obj)")
        self.lbl_file_2.pack(side="left", padx=15)
        self.btn_upload_2 = ctk.CTkButton(self.frame_upload_2, text="Upload S2", width=100, command=lambda: self.upload_file(2))
        self.btn_upload_2.pack(side="right", padx=15)

        self.frame_upload_3 = ctk.CTkFrame(self.input_frame, fg_color="transparent")
        self.frame_upload_3.pack(fill="x", pady=2)
        self.lbl_file_3 = ctk.CTkLabel(self.frame_upload_3, text="PCB and Lattices (.stl)")
        self.lbl_file_3.pack(side="left", padx=15)
        self.btn_upload_3 = ctk.CTkButton(self.frame_upload_3, text="Upload S4", width=100, command=lambda: self.upload_file(3))
        self.btn_upload_3.pack(side="right", padx=15)

        # PARAMETERS
        self.param_frame = ctk.CTkFrame(self)
        self.param_frame.pack(pady=5, padx=20, fill="x")
        
        # Configure 6 columns (0 to 5) to share space evenly
        self.param_frame.grid_columnconfigure((0, 1, 2, 3, 4, 5), weight=1)
        
        # --- HEADERS ---
        ctk.CTkLabel(self.param_frame, text="Stage 1: Lattice", font=ctk.CTkFont(weight="bold")).grid(row=0, column=0, columnspan=2, pady=5)
        ctk.CTkLabel(self.param_frame, text="Stage 2: Magnet", font=ctk.CTkFont(weight="bold")).grid(row=0, column=2, columnspan=2, pady=5)
        ctk.CTkLabel(self.param_frame, text="Stage 3: Base & PCB", font=ctk.CTkFont(weight="bold")).grid(row=0, column=4, columnspan=2, pady=5)
        
        # --- STAGE 1 (Left - Column 0) ---
        self.entry_e = self._create_entry(self.param_frame, "Young's (E):", "0.01", 1, 0)
        self.entry_nu = self._create_entry(self.param_frame, "Poisson's (nu):", "0.09", 2, 0)
        self.entry_c = self._create_entry(self.param_frame, "Cell Size (c):", "8.0", 3, 0)
        
        # --- STAGE 2 (Middle - Column 2) ---
        self.entry_md = self._create_entry(self.param_frame, "Dia:", "9.525", 1, 2)
        self.entry_mt = self._create_entry(self.param_frame, "Thick:", "3.175", 2, 2)
        self.entry_mx = self._create_entry(self.param_frame, "X:", "10.0", 3, 2)
        self.entry_my = self._create_entry(self.param_frame, "Y:", "10.0", 4, 2)
        self.entry_mz = self._create_entry(self.param_frame, "Z:", "1.0", 5, 2)

        # --- STAGE 3 (Right - Column 4) ---
        self.entry_bl = self._create_entry(self.param_frame, "Base L:", "50.0", 1, 4)
        self.entry_bw = self._create_entry(self.param_frame, "Base W:", "50.0", 2, 4)
        self.entry_bh = self._create_entry(self.param_frame, "Base H:", "7.0", 3, 4)
        
        self.btn_sw_folder = ctk.CTkButton(
            self.param_frame, 
            text="Customize", 
            width=100,      
            height=26,      
            command=self.open_sw_folder
        )
        self.btn_sw_folder.grid(row=4, column=4, columnspan=2, padx=10, pady=(5, 5))

        # ACTIONS
        self.action_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.action_frame.pack(pady=10, padx=10, fill="x")
        self.action_frame.grid_columnconfigure((0, 1, 2, 3, 4), weight=1)

        self.btn_s1 = ctk.CTkButton(self.action_frame, text="Run S1", command=lambda: self.start_pipeline("stage1"))
        self.btn_s1.grid(row=0, column=0, padx=3, pady=5, sticky="ew")

        self.btn_s2 = ctk.CTkButton(self.action_frame, text="Run S2", command=lambda: self.start_pipeline("stage2"))
        self.btn_s2.grid(row=0, column=1, padx=3, pady=5, sticky="ew")

        self.btn_s3 = ctk.CTkButton(self.action_frame, text="Run S3", command=lambda: self.start_pipeline("stage3"))
        self.btn_s3.grid(row=0, column=2, padx=3, pady=5, sticky="ew")

        self.btn_s4 = ctk.CTkButton(self.action_frame, text="Run S4", command=lambda: self.start_pipeline("stage4"))
        self.btn_s4.grid(row=0, column=3, padx=3, pady=5, sticky="ew")

        self.btn_full = ctk.CTkButton(self.action_frame, text="FULL PIPELINE", font=ctk.CTkFont(weight="bold"), fg_color="#2B8C52", command=lambda: self.start_pipeline("full"))
        self.btn_full.grid(row=0, column=4, padx=3, pady=5, sticky="ew")

        self.status_label = ctk.CTkLabel(self, text="Status: Ready", text_color="gray")
        self.status_label.pack(pady=5)

    def _create_entry(self, master, label, default, row, col):
        ctk.CTkLabel(master, text=label).grid(row=row, column=col, padx=5, pady=2, sticky="e")
        entry = ctk.CTkEntry(master, width=80)
        entry.insert(0, default)
        entry.grid(row=row, column=col+1, padx=5, pady=2, sticky="w")
        return entry

    def update_timers(self):
        if self.is_running:
            total_elapsed = int(time.time() - self.start_time_total)
            self.lbl_total_timer.configure(text=f"Total Elapsed: {total_elapsed//60:02d}:{total_elapsed%60:02d}")
            stage_elapsed = int(time.time() - self.start_time_stage)
            self.lbl_stage_timer.configure(text=f"Stage Timer: {stage_elapsed//60:02d}:{stage_elapsed%60:02d}")
            self.after(1000, self.update_timers)

    def suggest_coordinates(self):
        try:
            c = float(self.entry_c.get())
            self.btn_suggest.configure(state="disabled", text="✨ Calculating...")
            self.status_label.configure(text="Status: Calculating optimal grid nodes...", text_color="yellow")

            def finish_suggestion():
                self.entry_mx.delete(0, 'end'); self.entry_mx.insert(0, str(round(c * 2.0, 2)))
                self.entry_my.delete(0, 'end'); self.entry_my.insert(0, str(round(c * 1.5, 2)))
                self.btn_suggest.configure(state="normal", text="✨ Suggest X & Y")
                self.status_label.configure(text="Status: Coordinates suggested successfully!", text_color="green")
            self.after(600, finish_suggestion)
        except ValueError:
            messagebox.showwarning("Input Error", "Please enter a valid numeric value for Cell Size (c).")

    def open_sw_folder(self):
        # Update this path to your actual SolidWorks folder
        sw_folder_path = r"D:\miCADstructure\SolidWorks_Base_Files" 
        
        try:
            subprocess.Popen(["explorer.exe", sw_folder_path])
            self.status_label.configure(text="Status: Opened SolidWorks folder", text_color="green")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open folder: {str(e)}")

    def upload_file(self, stage):
        if stage in [1, 2]:
            path = filedialog.askopenfilename(initialdir="/mnt/d/miCADstructure/Data_Input")
            if path:
                if stage == 1: 
                    self.filepath_s1 = path
                    self.lbl_file_1.configure(text=f"Base CAD: {os.path.basename(path)}")
                elif stage == 2: 
                    self.filepath_s2 = path
                    self.lbl_file_2.configure(text=f"Microstructure: {os.path.basename(path)}")
        elif stage == 3:  
            paths = filedialog.askopenfilenames(
                title="Select multiple STL/3MF files",
                initialdir="/mnt/d/miCADstructure/Data_Output",
                filetypes=[("3D Models", "*.stl *.obj *.3mf"), ("All Files", "*.*")]
            )
            if paths:
                self.filepaths_s4 = list(paths)
                self.lbl_file_3.configure(text=f"PCB and Lattices: {len(paths)} files selected")
                
    def toggle_buttons(self, state):
        self.btn_s1.configure(state=state)
        self.btn_s2.configure(state=state)
        self.btn_s3.configure(state=state)
        self.btn_s4.configure(state=state)
        self.btn_full.configure(state=state)
        self.btn_upload_1.configure(state=state)
        self.btn_upload_2.configure(state=state)
        self.btn_upload_3.configure(state=state)

    def start_pipeline(self, mode):
        if mode in ["stage1", "full"] and not self.filepath_s1:
            messagebox.showwarning("Warning", "Please upload Stage 1 input!")
            return
        if mode == "stage2" and not self.filepath_s2:
            messagebox.showwarning("Warning", "Please upload Stage 2 input!")
            return

        files_for_s4 = []
        if mode == "stage4":
            if not hasattr(self, 'filepaths_s4') or not self.filepaths_s4:
                messagebox.showwarning("Warning", "Please upload Stage 4 files first!")
                return
            files_for_s4 = self.filepaths_s4

        self.is_running = True
        self.start_time_total = time.time()
        self.start_time_stage = time.time()
        
        try:
            params = {
                "E": self.entry_e.get(), "nu": self.entry_nu.get(), "c": self.entry_c.get(),
                "md": self.entry_md.get(), "mt": self.entry_mt.get(),
                "mx": self.entry_mx.get(), "my": self.entry_my.get(), "mz": self.entry_mz.get(),
                "bl": self.entry_bl.get(), "bw": self.entry_bw.get(),
                "bh": self.entry_bh.get(),
                "s4_files": files_for_s4 
            }
            self.toggle_buttons("disabled")
            self.update_timers()
            threading.Thread(target=self.run_process, args=(params, mode)).start()
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def run_process(self, params, mode):
        output_dir = "/mnt/d/miCADstructure/Data_Output"
        os.makedirs(output_dir, exist_ok=True)
        
        log_file_path = os.path.join(output_dir, "session_log.txt")
        with open(log_file_path, "a" if mode != "full" else "w") as log_f:
            log_f.write(f"\n--- SESSION START ({mode.upper()}): {datetime.now()} ---\n")

        def write_log(text):
            print(text, end="")
            with open(log_file_path, "a") as f: f.write(text)

        def wsl_to_win(wsl_path):
            if not wsl_path: return ""
            if wsl_path.startswith("/mnt/"):
                drive = wsl_path[5].upper()
                return f"{drive}:\\" + wsl_path[7:].replace("/", "\\")
            return wsl_path

        report_data = {"mode": mode, "params": params, "stages": {}}
        stage1_out = ""
        stage2_out = ""
        stage3_out = ""
        
        # --- STAGE 1 ---
        if mode in ["stage1", "full"]:
            self.start_time_stage = time.time()
            self.after(0, lambda: self.status_label.configure(text="Status: Executing Stage 1 (Lattice)...", text_color="yellow"))
            s1_start = time.time()
            
            base_name_s1 = os.path.basename(self.filepath_s1).split('.')[0]
            stage1_out = os.path.join(output_dir, f"{base_name_s1}_{params['E']}_{params['c']}.obj_False.obj")
            notebook_in = "/mnt/d/miCADstructure/Tools/microstructure_inflators/cut-cell.ipynb"
            
            write_log(f"\n[STAGE 1] Running Lattice Generation...\n")
            try:
                pm.execute_notebook(
                    notebook_in, os.path.join(output_dir, f"log_stage1_{base_name_s1}.ipynb"),
                    parameters={"input_surface": self.filepath_s1, "E": float(params["E"]), "nu": float(params["nu"]), "cell_size": float(params["c"])},
                    cwd=os.path.dirname(notebook_in), log_output=True
                )
                report_data["stages"]["Stage 1"] = f"{int(time.time() - s1_start)}s"
            except Exception as e:
                err_msg = str(e)
                self.after(0, lambda msg=err_msg: self.finish_ui(False, f"Stage 1 Error: {msg}"))
                return

            if mode == "stage1":
                self.after(0, lambda: self.finish_ui(True, f"Stage 1 Complete!\nSaved:\n{stage1_out}"))
                return

        # --- STAGE 2 ---
        if mode in ["stage2", "full"]:
            self.start_time_stage = time.time()
            self.after(0, lambda: self.status_label.configure(text="Status: Executing Stage 2 (Blender Pouch)...", text_color="cyan"))
            s2_start = time.time()
            
            blender_in = stage1_out if mode == "full" else self.filepath_s2
            clean_name = os.path.basename(blender_in).replace('.obj_False.obj', '').replace('.obj', '')
            stage2_out = os.path.join(output_dir, f"{clean_name}_with_pouch.stl")
            blender_script = "/mnt/d/miCADstructure/Tools/microstructure_inflators/create_pouch.py"

            cmd = [
                "blender", "--background", "--python", blender_script, "--",
                "-i", blender_in, "-o", stage2_out,
                "-d", str(params["md"]), "-t", str(params["mt"]),
                "-x", str(params["mx"]), "-y", str(params["my"]), "-z", str(params["mz"]),
                "--length", str(params["bl"]), "--width", str(params["bw"]), "--height", str(params["bh"])
            ]
            
            write_log(f"\n[STAGE 2] Running Blender Pouch...\n")
            try:
                process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                for line in process.stdout: write_log(line)
                process.wait()
                if process.returncode != 0: raise Exception("Blender execution failed.")
                report_data["stages"]["Stage 2"] = f"{int(time.time() - s2_start)}s"
            except Exception as e:
                err_msg = str(e)
                self.after(0, lambda msg=err_msg: self.finish_ui(False, f"Stage 2 Error: {msg}"))
                return

            if mode == "stage2":
                self.after(0, lambda: self.finish_ui(True, f"Stage 2 Complete!\nSaved:\n{stage2_out}"))
                return

        # --- STAGE 3 ---
        if mode in ["stage3", "full"]:
            self.start_time_stage = time.time()
            self.after(0, lambda: self.status_label.configure(text="Status: Executing Stage 3 (Standalone Base & Slot)...", text_color="#d35400"))
            s3_start = time.time()
            
            base_prefix = "Parametric_Base"
            if self.filepath_s1:
                base_prefix = os.path.basename(self.filepath_s1).split('.')[0] + "_Base"
                
            stage3_out = os.path.join(output_dir, f"{base_prefix}_with_PCBSlot.stl")
            blender_s3_script = "/mnt/d/miCADstructure/Tools/core/create_stage3_base.py"
            
            cmd_s3 = [
                "blender", "--background", "--python", blender_s3_script, "--",
                "-o", stage3_out,
                "--length", str(params["bl"]), "--width", str(params["bw"]),
                "--height", str(params["bh"])
            ]
            
            write_log(f"\n[STAGE 3] Generating Standalone Base & Slotting...\n")
            try:
                process_s3 = subprocess.Popen(cmd_s3, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                for line in process_s3.stdout: write_log(line)
                process_s3.wait()
                if process_s3.returncode != 0: raise Exception("Blender Stage 3 execution failed.")
                report_data["stages"]["Stage 3"] = f"{int(time.time() - s3_start)}s"
            except Exception as e:
                err_msg = str(e)
                self.after(0, lambda msg=err_msg: self.finish_ui(False, f"Stage 3 Error: {msg}"))
                return

            if mode == "stage3":
                self.after(0, lambda: self.finish_ui(True, f"Stage 3 Complete!\nSaved:\n{stage3_out}"))
                return

        # --- STAGE 4: ORCASLICER INTEGRATION ---
        if mode in ["stage4", "full"]:
            self.start_time_stage = time.time()
            self.after(0, lambda: self.status_label.configure(text="Status: Executing Stage 4 (Opening OrcaSlicer)...", text_color="#9b59b6"))
            s4_start = time.time()

            write_log(f"\n[STAGE 4] Launching OrcaSlicer in Windows...\n")
            
            orca_exe_path = r"C:\Program Files\OrcaSlicer\orca-slicer.exe"

            try:
                files_to_open = []
                if mode == "full":
                    files_to_open = [wsl_to_win(stage2_out), wsl_to_win(stage3_out)]
                else:
                    files_to_open = [wsl_to_win(f) for f in params.get("s4_files", [])]

                files_to_open = [f for f in files_to_open if f]
                
                cmd_s4 = ["cmd.exe", "/c", "start", "", orca_exe_path] + files_to_open
                
                subprocess.Popen(cmd_s4)
                report_data["stages"]["Stage 4"] = f"{int(time.time() - s4_start)}s"
            except Exception as e:
                err_msg = str(e)
                self.after(0, lambda msg=err_msg: self.finish_ui(False, f"Stage 4 Error: {msg}"))
                return
                        
        # --- FINALIZATION ---
        self.is_running = False
        total_duration = int(time.time() - self.start_time_total)
        
        report_path = os.path.join(output_dir, "execution_report.txt")
        with open(report_path, "a") as rf:
            rf.write("\n=== CAD2eFLESH EXECUTION REPORT ===\n")
            rf.write(f"Date: {datetime.now()}\n")
            rf.write(f"Total Duration: {total_duration} seconds\n")
            rf.write(f"Mode: {mode}\n")
            for stage, dur in report_data["stages"].items():
                rf.write(f"{stage}: {dur}\n")
            rf.write("Status: Completed Successfully\n")

        if mode == "full":
            msg = f"PIPELINE AUTOMATION COMPLETE!\nTotal Time: {total_duration}s\nOrcaSlicer has been launched with your files."
        elif mode == "stage4":
            msg = f"OrcaSlicer Launched!\nCheck your Windows desktop."
        
        self.after(0, lambda: self.finish_ui(True, msg))

    def finish_ui(self, success, msg):
        self.is_running = False
        self.toggle_buttons("normal")
        self.status_label.configure(text="Status: Finished", text_color="green" if success else "red")
        if success: messagebox.showinfo("Success", msg)
        else: messagebox.showerror("Failed", msg)

if __name__ == "__main__":
    app = CAD2eFleshApp()
    app.mainloop()