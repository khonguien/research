import papermill as pm
import os

def run_stage_1_notebook(input_stl, E, nu, c):
    # Đã đổi toàn bộ sang đường dẫn WSL
    notebook_path = "/mnt/d/miCADstructure/Tools/microstructure_inflators/cut-cell.ipynb"
    base_name = os.path.basename(input_stl)[:-4] 
    output_notebook_path = f"/mnt/d/miCADstructure/Data_Output/executed_{base_name}.ipynb"
    
    if not os.path.exists(notebook_path):
        raise FileNotFoundError(f"Không tìm thấy file Notebook tại: {notebook_path}")

    print(f"Đang kích hoạt Notebook: {notebook_path}...")
    
    notebook_dir = os.path.dirname(notebook_path)
    
    pm.execute_notebook(
        notebook_path,
        output_notebook_path,
        parameters=dict(
            input_surface=input_stl,  
            E=E,                      
            nu=nu,                    
            cell_size=c               
        ),
        cwd=notebook_dir 
    )
    
    # Giả định only_cube_cells = False
    only_cube_cells = False
    base_name_without_ext = input_stl[:-4] 
    expected_out_path = f"{base_name_without_ext}_{E}_{c}.obj_{only_cube_cells}.obj"
    
    if not os.path.exists(expected_out_path):
        print(f"[CẢNH BÁO] Không tìm thấy file output tại {expected_out_path}.")
        
    return expected_out_path