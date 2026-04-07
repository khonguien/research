# Install script for directory: /mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "release")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set default install directory permissions.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if("x${CMAKE_INSTALL_COMPONENT}x" STREQUAL "xUnspecifiedx" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/cmake/OpenVDB" TYPE FILE FILES
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindBlosc.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindJemalloc.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindIlmBase.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindLog4cplus.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindOpenEXR.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindOpenVDB.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/FindTBB.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/OpenVDBGLFW3Setup.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/OpenVDBHoudiniSetup.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/OpenVDBMayaSetup.cmake"
    "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-src/cmake/OpenVDBUtils.cmake"
    )
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for the subdirectory.
  include("/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/_deps/openvdb-build/openvdb/openvdb/cmake_install.cmake")
endif()

