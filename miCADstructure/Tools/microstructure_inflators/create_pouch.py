import bpy, argparse
import sys

def add_cube(name, size, loc):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    obj.location = loc
    return obj

def create_cylinder(name, radius, depth, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, location=location, depth=depth, vertices=128)
    obj = bpy.context.object
    obj.name = name
    return obj

def boolean(obj1_name, obj2_name, operation_type = "DIFFERENCE"):
    bpy.context.view_layer.objects.active = bpy.context.scene.objects[obj1_name]
    mod = bpy.context.scene.objects[obj1_name].modifiers.new(name="Boolean", type='BOOLEAN')
    mod.operation = operation_type
    mod.solver = 'FAST' 
    mod.use_self = False
    mod.object = bpy.context.scene.objects[obj2_name]  
    bpy.ops.object.modifier_apply(modifier=mod.name, report=True)
    bpy.data.objects.remove(bpy.context.scene.objects[obj2_name])

def export_mesh(filepath):
    # Xuất file chuẩn STL để đưa vào OrcaSlicer
    bpy.ops.export_mesh.stl(filepath=filepath, use_selection=True)

def create_pouch(magnet_diameter, magnet_thickness, center=[0, 0, 0], name="pouch"):
    clearance = 0.2      # Dung sai hở 0.2mm để nhét nam châm dễ dàng
    wall_thickness = 1.5 # Bề dày vách của cái túi (1.5mm)

    magnet_radius = magnet_diameter / 2.0
    
    # 1. Khoang rỗng chứa nam châm (Magnet Cavity)
    midXY = magnet_radius + clearance
    midZ = magnet_thickness + clearance

    # 2. Vỏ ngoài của túi (Outer Pouch)
    outerXY = midXY + wall_thickness
    outerZ = midZ + (wall_thickness * 2.0)

    # 3. Lỗ nhét nam châm ở trên cùng
    lidXY = magnet_radius * 0.8
    lidZ = outerZ # Dài qua nắp để cắt lủng

    convex_hull = create_cylinder(name + "_convex", radius=outerXY * 0.99, depth=outerZ * 0.99, location=(0, 0, 0))
    pouch_obj = create_cylinder(name, radius=outerXY, depth=outerZ, location=(0, 0, 0))
    
    cylinder1 = create_cylinder(name + "_cylinder1", radius=midXY, depth=midZ, location=(0, 0, 0))
    cylinder3 = create_cylinder(name + "_cylinder3", radius=lidXY, depth=lidZ, location=(0, 0, outerZ/2.0))

    boolean(name, name + "_cylinder1", "DIFFERENCE")
    boolean(name, name + "_cylinder3", "DIFFERENCE")

    bpy.context.scene.objects[name + "_convex"].location = center
    bpy.context.scene.objects[name].location = center

    return name + "_convex", name

if __name__ == "__main__":
    if "--" in sys.argv:
        argv = sys.argv[sys.argv.index("--") + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input', required=True)
    parser.add_argument('-o', '--output', required=True)
    parser.add_argument('-d', '--diameter', type=float, default=15.0)
    parser.add_argument('-t', '--thickness', type=float, default=3.2)
    parser.add_argument('-x', '--cx', type=float, default=15.0)
    parser.add_argument('-y', '--cy', type=float, default=10.0)
    parser.add_argument('-z', '--cz', type=float, default=1.0)
    
    # ĐÃ SỬA: KHÔNG DÙNG VIẾT TẮT NỮA ĐỂ KHÔNG CHẠM MẶT LỖI ARGPARSE
    parser.add_argument('--length', type=float, default=50.0)
    parser.add_argument('--width', type=float, default=50.0)
    parser.add_argument('--height', type=float, default=7.0)
    
    args = parser.parse_args(argv)

    L = args.length
    W = args.width
    H = args.height

    list_of_magnets = []
    x_signs = [1, -1] if args.cx != 0 else [1]
    y_signs = [1, -1] if args.cy != 0 else [1]

    for sx in x_signs:
        for sy in y_signs:
            list_of_magnets.append([args.diameter, args.thickness, [args.cx * sx, args.cy * sy, args.cz]])

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    existing_objs = set(bpy.context.scene.objects)
    bpy.ops.import_scene.obj(filepath=args.input)
    new_objs = set(bpy.context.scene.objects) - existing_objs
    
    if new_objs:
        imported_object = list(new_objs)[0]
        bpy.context.view_layer.objects.active = imported_object
        imported_object.name = "micro"
    else:
        print("Error: Could not find imported object!")
        sys.exit(1)

    print("Simplifying mesh via Decimate modifier...")
    decimate_mod = bpy.context.scene.objects["micro"].modifiers.new(name="Decimate", type='DECIMATE')
    decimate_mod.ratio = 0.1  
    bpy.context.view_layer.objects.active = bpy.context.scene.objects["micro"]
    bpy.ops.object.modifier_apply(modifier=decimate_mod.name, report=True)

    print(f"Executing Boolean operations for {len(list_of_magnets)} pouches...")
    for index, magnet in enumerate(list_of_magnets):
        convex_hull, pouch_obj = create_pouch(magnet[0], magnet[1], magnet[2], "pouch" + str(index))
        boolean("micro", convex_hull, "DIFFERENCE")
        boolean("micro", pouch_obj, "UNION")

    # ==============================================================
    # CHÈN NGÀM CONNECTOR VÀO ĐÁY LATTICE (FIX ĐỘ DÀY VIỀN CHUẨN 0.7)
    # ==============================================================
    print("Calculating Microstructure Bounding Box to attach Connector...")
    import mathutils
    micro_obj = bpy.context.scene.objects["micro"]
    
    bbox_corners = [micro_obj.matrix_world @ mathutils.Vector(corner) for corner in micro_obj.bound_box]
    
    # Lấy đáy Z và tâm XY của khối Lattice
    min_z = min([v.z for v in bbox_corners])
    min_x, max_x = min([v.x for v in bbox_corners]), max([v.x for v in bbox_corners])
    min_y, max_y = min([v.y for v in bbox_corners]), max([v.y for v in bbox_corners])
    mid_x, mid_y = (min_x + max_x) / 2.0, (min_y + max_y) / 2.0

    # 1. TẠO TẤM NGÀM CHÍNH (ĐỘ DÀY CHÍNH XÁC 0.7mm)
    plate_h = 0.7
    plate_z = min_z - (plate_h / 2.0)
    connector_plate = add_cube("Connector_Plate", (W - 1.5, L - 1.5, plate_h), (mid_x, mid_y, plate_z))

    # 2. OVERLAP BLOCK
    overlap_h = 0.2
    overlap_z = min_z
    overlap_block = add_cube("Connector_Overlap", (W*0.01, L*0.01, overlap_h), (mid_x, mid_y, overlap_z))

    # 3. KẾT DÍNH 3 THỨ LẠI VỚI NHAU
    print("Fusing Connector parts...")
    boolean(connector_plate.name, overlap_block.name, "UNION")
    boolean("micro", connector_plate.name, "UNION")

    # ==============================================================
    print("Triangulating mesh for Slicer compatibility...")
    tri_mod = bpy.context.scene.objects["micro"].modifiers.new(name="Triangulate", type='TRIANGULATE')
    bpy.context.view_layer.objects.active = bpy.context.scene.objects["micro"]
    bpy.ops.object.modifier_apply(modifier=tri_mod.name, report=True)

    print("Exporting final STL mesh...")
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.scene.objects["micro"].select_set(True)
    export_mesh(args.output)
    
    print(f"Stage 2 Finished! Saved to {args.output}")