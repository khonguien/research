#!/bin/csh
setenv TBBROOT "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/3rdparty/tbb" #
setenv tbb_bin "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/tbb_cmake_build/tbb_cmake_build_subdir_debug" #
if (! $?CPATH) then #
    setenv CPATH "${TBBROOT}/include" #
else #
    setenv CPATH "${TBBROOT}/include:$CPATH" #
endif #
if (! $?LIBRARY_PATH) then #
    setenv LIBRARY_PATH "${tbb_bin}" #
else #
    setenv LIBRARY_PATH "${tbb_bin}:$LIBRARY_PATH" #
endif #
if (! $?LD_LIBRARY_PATH) then #
    setenv LD_LIBRARY_PATH "${tbb_bin}" #
else #
    setenv LD_LIBRARY_PATH "${tbb_bin}:$LD_LIBRARY_PATH" #
endif #
 #
