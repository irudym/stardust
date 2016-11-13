##
#	HAML and SASS files compiler for cordova application development
#   Fennec(C)2016 by Igor Rudym
#
#	The file should be placed into application root directory
#	Usage: ruby compie.rb
## 

$file_count = 0

def pluralize(singular, n, plural=nil)
    if n == 1
        "#{singular}"
    elsif plural
        "#{plural}"
    else
        "#{singular}s"
    end
end


def compile(extension, new_ext, dir = '')
	full_dir = 'www'
	full_dir += '/' + dir unless dir.eql? ''
	Dir.foreach(full_dir) do |item|
		next if item == '.' or item == '..'
		if File.extname(item).split('.')[1] == extension 
			new_file_name = full_dir +'/' + File.basename(item,File.extname(item)) + '.' + new_ext
			# puts "compile file #{item} into #{new_file_name}" 
			extension = 'sass' if extension.eql? 'scss'
			system ("#{extension} #{full_dir +'/' + item} > #{new_file_name}")
			$file_count += 1
		end
		print '.'
	end	
end

puts "Compile HAML and SCSS files in WWW directory"
#compile all files

compile('haml', 'html')
compile('scss', 'css', 'css')

puts "Done!"
puts "#{$file_count} #{pluralize('file', $file_count)} compiled."


