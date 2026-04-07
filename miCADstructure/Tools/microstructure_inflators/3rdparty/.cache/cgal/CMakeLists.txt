# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(cgal-download NONE)

include(ExternalProject)
ExternalProject_Add(cgal-download
                    GIT_CONFIG advice.detachedHead=false;URL;https://github.com/CGAL/cgal/releases/download/releases%2FCGAL-4.12/CGAL-4.12.tar.xz;URL_MD5;b12fd24dedfa889a04abfaea565a88bd
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/cgal"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/cgal-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)
