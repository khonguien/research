import bpy
import argparse
import sys

# Xử lý tham số truyền vào từ app.py
if "--" in sys.argv:
    argv = sys.argv[sys.argv.index("--") + 1:]
else:
    argv = []

parser = argparse.ArgumentParser()
parser.add_argument('-o', '--output', required=True, help="Final Output STL")
parser.add_argument('-l', '--length', type=float, default=50.0)
parser.add_argument('-w', '--width', type=float, default=50.0)
parser.add_argument('-he', '--height', type=float, default=7.0)
parser.add_argument('--offset', type=float, default=1.6)
args = parser.parse_args(argv)

# DỌN SẠCH HIỆN TRƯỜNG VÀ CHUẨN HÓA UNIT
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 0.001 # 1 Unit = 1 mm

def add_cube(name, size, loc):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    obj.location = loc
    return obj

# ==================================================
# THÔNG SỐ TỪ APP.PY
# ==================================================
L = args.length
W = args.width
H = args.height
# O = args.offset # Độ sâu của Top Pocket


base = add_cube("Base_Plate", (W, L, H), (0, 0, H / 2.0))


# Dao 1: Cắt từ đỉnh (Z=H) xuống
pocket = add_cube("Top_Pocket_Cutter_1", (W - 3.0, L - 3.0, 0.9), (0, 0, H - (0.9 / 2.0)))

# Dao 2: Thêm 0.1mm chiều cao và nhích tâm lên 0.05mm để cắn ngập vào khoảng không của Dao 1
pocket_2 = add_cube("Top_Pocket_Cutter_2", (W - 1.5, L - 1.5, 0.7 + 0.1), (0, 0, H - 0.9 - (0.7 / 2.0) + 0.05))

# Dao 3: Rãnh chính
wide_slot = add_cube("Wide_Slot_Cutter", (20.6, 31.0, 2), (0, -(L / 2.0) + 14.5, H - 2.5 - 1))

# Dao 4: Thêm 0.1mm chiều cao và nhích tâm lên 0.05mm để cắn ngập vào khoảng không của Dao 3
narrow_slot = add_cube("Narrow_Slot_Cutter", (7.0, 11.0, 1.82 + 0.1), (0, -(L / 2.0) + 4.5, H - 4.5 - (1.82 / 2.0) + 0.05))

cutters = [pocket, pocket_2, wide_slot, narrow_slot]


bpy.context.view_layer.objects.active = base
base.select_set(True)

for cutter in cutters:
    mod = base.modifiers.new(name="Cut_"+cutter.name, type='BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.solver = 'FAST'
    mod.object = cutter
    
    bpy.context.view_layer.objects.active = base
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter)

# Triangulate
tri_mod = base.modifiers.new(name="Triangulate", type='TRIANGULATE')
bpy.context.view_layer.objects.active = base
bpy.ops.object.modifier_apply(modifier=tri_mod.name)

# Xuất mô hình
bpy.ops.object.select_all(action='DESELECT')
base.select_set(True)
bpy.context.view_layer.objects.active = base

bpy.ops.export_mesh.stl(filepath=args.output, use_selection=True)

print(f"Model generation complete. Saved to {args.output}")