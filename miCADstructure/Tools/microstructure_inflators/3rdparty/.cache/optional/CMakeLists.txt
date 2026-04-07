# Distributed under the OSI-approved MIT License.  See accompanying
# file LICENSE or https://github.com/Crascit/DownloadProject for details.

cmake_minimum_required(VERSION 2.8.2)

project(optional-download NONE)

include(ExternalProject)
ExternalProject_Add(optional-download
                    GIT_CONFIG advice.detachedHead=false;URL;https://github.com/martinmoene/optional-lite/archive/v3.0.0.tar.gz;URL_MD5;a66541380c51c0d0a1e593cc2ca9fe8a
                    SOURCE_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/cmake/../3rdparty/optional"
                    BINARY_DIR          "/mnt/d/eFlesh-main/eFlesh-main/microstructure/microstructure_inflators/build/optional-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
)
