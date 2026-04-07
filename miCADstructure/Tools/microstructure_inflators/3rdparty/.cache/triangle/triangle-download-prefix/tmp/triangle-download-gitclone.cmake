
if(NOT "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/.cache/triangle/triangle-download-prefix/src/triangle-download-stamp/triangle-download-gitinfo.txt" IS_NEWER_THAN "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/.cache/triangle/triangle-download-prefix/src/triangle-download-stamp/triangle-download-gitclone-lastrun.txt")
  message(STATUS "Avoiding repeated git clone, stamp file is up to date: '/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/.cache/triangle/triangle-download-prefix/src/triangle-download-stamp/triangle-download-gitclone-lastrun.txt'")
  return()
endif()

execute_process(
  COMMAND ${CMAKE_COMMAND} -E rm -rf "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/triangle"
  RESULT_VARIABLE error_code
  )
if(error_code)
  message(FATAL_ERROR "Failed to remove directory: '/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/triangle'")
endif()

# try the clone 3 times in case there is an odd git clone issue
set(error_code 1)
set(number_of_tries 0)
while(error_code AND number_of_tries LESS 3)
  execute_process(
    COMMAND "/usr/bin/git"  clone --no-checkout --config "advice.detachedHead=false" --config "advice.detachedHead=false" "https://github.com/Huangzizhou/triangle.git" "triangle"
    WORKING_DIRECTORY "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty"
    RESULT_VARIABLE error_code
    )
  math(EXPR number_of_tries "${number_of_tries} + 1")
endwhile()
if(number_of_tries GREATER 1)
  message(STATUS "Had to git clone more than once:
          ${number_of_tries} times.")
endif()
if(error_code)
  message(FATAL_ERROR "Failed to clone repository: 'https://github.com/Huangzizhou/triangle.git'")
endif()

execute_process(
  COMMAND "/usr/bin/git"  checkout c80ac9a5efd0c199d7cda4730489391f2ed40178 --
  WORKING_DIRECTORY "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/triangle"
  RESULT_VARIABLE error_code
  )
if(error_code)
  message(FATAL_ERROR "Failed to checkout tag: 'c80ac9a5efd0c199d7cda4730489391f2ed40178'")
endif()

set(init_submodules TRUE)
if(init_submodules)
  execute_process(
    COMMAND "/usr/bin/git"  submodule update --recursive --init 
    WORKING_DIRECTORY "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/triangle"
    RESULT_VARIABLE error_code
    )
endif()
if(error_code)
  message(FATAL_ERROR "Failed to update submodules in: '/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/triangle'")
endif()

# Complete success, update the script-last-run stamp file:
#
execute_process(
  COMMAND ${CMAKE_COMMAND} -E copy
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/.cache/triangle/triangle-download-prefix/src/triangle-download-stamp/triangle-download-gitinfo.txt"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/.cache/triangle/triangle-download-prefix/src/triangle-download-stamp/triangle-download-gitclone-lastrun.txt"
  RESULT_VARIABLE error_code
  )
if(error_code)
  message(FATAL_ERROR "Failed to copy script-last-run stamp file: '/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/.cache/triangle/triangle-download-prefix/src/triangle-download-stamp/triangle-download-gitclone-lastrun.txt'")
endif()

